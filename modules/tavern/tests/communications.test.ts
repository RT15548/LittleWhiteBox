import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    appendTavernMessage,
    tavernCommunicationSnapshotsTable,
} from '../shared/session-db';
import {
    appendPendingTavernCommunicationMessage,
    completeTavernCommunicationExchange,
    createTavernCommunicationContact,
    describeTavernCommunicationRestoreImpact,
    failTavernCommunicationMessage,
    listTavernCommunicationContacts,
    listTavernCommunicationMessages,
    listTavernCommunicationTimelineEvents,
    listTavernCommunicationThreads,
    recoverInterruptedTavernCommunicationMessages,
    restoreTavernCommunicationsToFloor,
    retryFailedTavernCommunicationMessage,
    saveTavernCommunicationSnapshot,
    trimTavernCommunicationSnapshotsFromFloor,
} from '../shared/communications';
import { buildTavernPhoneRequestMessages } from '../app-src/features/phone/tavern-phone-context';

test('phone communications persist independently and anchor to the current Tavern timeline position', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone', characterName: 'Aster' });
    const { contact, thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        memoryPath: 'memory/characters/艾琳.md',
        source: 'memory',
    });
    await appendTavernMessage(session.id, { role: 'user', content: '我走进车站。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '雨水顺着站台顶棚落下。' });
    const pending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '你在哪？',
    });
    await completeTavernCommunicationExchange({
        pendingMessage: pending,
        replies: ['我还在车站。', '你要过来吗？'],
        result: 'reply',
        summary: '玩家询问位置，艾琳仍在车站。',
        provider: 'test',
        model: 'phone-model',
    });

    const contacts = await listTavernCommunicationContacts(session.id);
    const threads = await listTavernCommunicationThreads(session.id);
    const messages = await listTavernCommunicationMessages(session.id, thread.id);
    assert.equal(contacts[0]?.id, contact.id);
    assert.equal(threads[0]?.contactId, contact.id);
    assert.deepEqual(messages.map((message) => [message.role, message.content, message.status]), [
        ['user', '你在哪？', 'sent'],
        ['contact', '我还在车站。', 'sent'],
        ['contact', '你要过来吗？', 'sent'],
    ]);
    assert.deepEqual(messages.map((message) => message.anchorOrder), [1, 1, 1]);

    const events = await listTavernCommunicationTimelineEvents(session.id, {
        fromAnchorOrder: 1,
        toAnchorOrder: 1,
    });
    assert.equal(events.length, 1);
    assert.equal(events[0]?.anchorOrder, 1);
    assert.match(String(events[0]?.content || ''), /私人手机通讯/);
    assert.match(String(events[0]?.content || ''), /艾琳：我还在车站/);
    assert.deepEqual(await listTavernCommunicationTimelineEvents(session.id, {
        fromAnchorOrder: 2,
        toAnchorOrder: 5,
    }), []);
});

test('silent and unavailable phone results never persist contradictory reply bubbles', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone silent' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '静默联系人',
        source: 'manual',
    });
    const pending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '在吗？',
    });
    await completeTavernCommunicationExchange({
        pendingMessage: pending,
        result: 'silent',
        replies: ['这条不应该落库'],
        summary: '玩家尝试联系，对方未回复。',
    });

    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => [message.role, message.content]),
        [['user', '在吗？']],
    );
    const storedThread = (await listTavernCommunicationThreads(session.id))[0];
    assert.equal(storedThread?.lastResult, 'silent');
    assert.equal(storedThread?.summary, '玩家尝试联系，对方未回复。');
});

test('failed phone messages retry without duplicating the user bubble and reanchor to the current story floor', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone retry' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '伊芙',
        source: 'manual',
    });
    const pending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '重试这一条',
    });
    const failed = await failTavernCommunicationMessage(pending, new Error('network'));
    assert.ok(failed);
    const latestMain = await appendTavernMessage(session.id, { role: 'user', content: '剧情已经继续。' });
    const retried = await retryFailedTavernCommunicationMessage(failed);
    const messages = await listTavernCommunicationMessages(session.id, thread.id);

    assert.equal(retried.sequence, failed.sequence);
    assert.equal(retried.anchorOrder, latestMain.order);
    assert.equal(retried.status, 'pending');
    assert.equal(messages.length, 1);
});

test('retrying an older failed phone message moves it after later exchanges without overwriting them', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone retry after later messages' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '伊芙',
        source: 'manual',
    });
    const firstPending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '较早失败消息',
    });
    const firstFailed = await failTavernCommunicationMessage(firstPending, new Error('network'));
    assert.ok(firstFailed);
    const laterPending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '后续正常消息',
    });
    await completeTavernCommunicationExchange({
        pendingMessage: laterPending,
        replies: ['后续正常回复'],
    });

    const retried = await retryFailedTavernCommunicationMessage(firstFailed);
    assert.equal(retried.sequence, 3);
    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => [message.sequence, message.content, message.status]),
        [
            [1, '后续正常消息', 'sent'],
            [2, '后续正常回复', 'sent'],
            [3, '较早失败消息', 'pending'],
        ],
    );

    await completeTavernCommunicationExchange({
        pendingMessage: retried,
        replies: ['重试后的回复'],
    });
    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => [message.sequence, message.content]),
        [
            [1, '后续正常消息'],
            [2, '后续正常回复'],
            [3, '较早失败消息'],
            [4, '重试后的回复'],
        ],
    );
});

test('phone communication snapshots restore and trim with accepted floors', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone rollback' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '诺拉',
        source: 'manual',
    });
    await saveTavernCommunicationSnapshot(session.id, -1);
    const first = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '第一条',
    });
    await completeTavernCommunicationExchange({ pendingMessage: first, replies: ['收到'] });
    await saveTavernCommunicationSnapshot(session.id, 2);
    const second = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '第二条',
    });
    await completeTavernCommunicationExchange({ pendingMessage: second, replies: ['稍后见'] });

    const impact = await describeTavernCommunicationRestoreImpact(session.id, 2);
    assert.equal(impact.changed, true);
    assert.equal(impact.currentMessageCount, 4);
    assert.equal(impact.targetMessageCount, 2);

    await restoreTavernCommunicationsToFloor(session.id, 2);
    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => message.content),
        ['第一条', '收到'],
    );
    assert.deepEqual(await completeTavernCommunicationExchange({ pendingMessage: second, replies: ['迟到回复'] }), []);
    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => message.content),
        ['第一条', '收到'],
    );
    assert.equal(await trimTavernCommunicationSnapshotsFromFloor(session.id, 2), 1);
});

test('phone snapshots skip empty and unchanged state while rollback impact includes contact-only changes', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone snapshot dedupe' });
    assert.equal(await saveTavernCommunicationSnapshot(session.id, 0), null);
    assert.equal(await tavernCommunicationSnapshotsTable.where('sessionId').equals(session.id).count(), 0);

    await createTavernCommunicationContact({ sessionId: session.id, name: '联系人一', source: 'manual' });
    assert.ok(await saveTavernCommunicationSnapshot(session.id, 0));
    assert.equal(await saveTavernCommunicationSnapshot(session.id, 2), null);
    assert.equal(await tavernCommunicationSnapshotsTable.where('sessionId').equals(session.id).count(), 1);

    await createTavernCommunicationContact({ sessionId: session.id, name: '联系人二', source: 'manual' });
    const impact = await describeTavernCommunicationRestoreImpact(session.id, 0);
    assert.equal(impact.changed, true);
    assert.equal(impact.currentMessageCount, 0);
    assert.equal(impact.targetMessageCount, 0);
});

test('phone snapshots, recovery, and branching never preserve orphan pending messages', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone interrupted' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '中断联系人',
        source: 'manual',
    });
    const pending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '这条请求会中断。',
    });
    const snapshot = await saveTavernCommunicationSnapshot(session.id, 1);
    assert.equal(snapshot?.messages[0]?.status, 'failed');

    const branch = await branchTavernSession(session.id);
    assert.ok(branch);
    const branchThread = (await listTavernCommunicationThreads(branch?.id || ''))[0];
    assert.deepEqual(
        (await listTavernCommunicationMessages(branch?.id || '', branchThread?.id || '')).map((message) => message.status),
        ['failed'],
    );

    assert.equal(await recoverInterruptedTavernCommunicationMessages(session.id), 1);
    assert.equal((await listTavernCommunicationMessages(session.id, thread.id))[0]?.status, 'failed');
    assert.deepEqual(await completeTavernCommunicationExchange({ pendingMessage: pending, replies: ['迟到回复'] }), []);
});

test('reopening a phone thread after the main story advances creates a new timeline anchor', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone timeline anchors' });
    const contact = await createTavernCommunicationContact({ sessionId: session.id, name: '艾琳', source: 'manual' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '第一处剧情位置。' });
    const first = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '第一段通讯。',
    });
    await completeTavernCommunicationExchange({ pendingMessage: first, replies: ['第一段回复。'] });
    await appendTavernMessage(session.id, { role: 'user', content: '剧情继续。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '抵达第二处位置。' });
    const second = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '第二段通讯。',
    });
    await completeTavernCommunicationExchange({ pendingMessage: second, replies: ['第二段回复。'] });

    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, contact.thread.id)).map((message) => message.anchorOrder),
        [0, 0, 2, 2],
    );
    assert.deepEqual(
        (await listTavernCommunicationTimelineEvents(session.id)).map((event) => event.anchorOrder),
        [0, 2],
    );
});

test('phone generation uses the anchored Tavern history window and its own preset', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({
        title: 'Phone grounded context',
        characterName: '主角色',
        contextSnapshot: {
            character: {
                name: '主角色',
                description: 'NORMAL_MAIN_CHARACTER_CARD',
            },
            user: { name: '玩家' },
        },
    });
    const contact = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        memoryPath: 'memory/characters/艾琳.md',
        source: 'memory',
    });
    const earlier = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '之前的手机消息。',
    });
    await completeTavernCommunicationExchange({
        pendingMessage: earlier,
        replies: ['之前的手机回复。'],
        summary: '艾琳答应保持联系。',
    });
    for (let order = 0; order < 25; order += 1) {
        await appendTavernMessage(session.id, {
            role: order % 2 === 0 ? 'user' : 'assistant',
            content: `main-history-${order}`,
        });
    }
    const pending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '现在剧情进行到哪里了？',
    });
    const currentThread = (await listTavernCommunicationThreads(session.id))
        .find((thread) => thread.id === contact.thread.id) || contact.thread;
    const requestMessages = await buildTavernPhoneRequestMessages({
        sessionId: session.id,
        contextSnapshot: session.contextSnapshot || {},
        contact: contact.contact,
        contactProfile: 'CONTACT_MEMORY_MARKER',
        thread: currentThread,
        communicationMessages: await listTavernCommunicationMessages(session.id, contact.thread.id),
        pendingMessage: pending,
    });
    const raw = JSON.stringify(requestMessages);

    assert.match(raw, /小白酒馆当前剧情时间线/);
    assert.match(raw, /CONTACT_MEMORY_MARKER/);
    assert.doesNotMatch(raw, /NORMAL_MAIN_CHARACTER_CARD/);
    assert.match(raw, /之前的手机消息/);
    assert.match(raw, /之前的手机回复/);
    assert.match(raw, /艾琳答应保持联系/);
    assert.doesNotMatch(raw, /main-history-15/);
    assert.match(raw, /main-history-16/);
    assert.match(raw, /main-history-24/);
    assert.match(raw, /现在剧情进行到哪里了/);
    assert.ok(raw.indexOf('main-history-24') < raw.indexOf('之前的手机消息'));
    assert.ok(raw.indexOf('之前的手机回复') < raw.indexOf('现在剧情进行到哪里了'));
});

test('session branching clones phone state and session deletion cascades it', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone branch' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '米娅',
        source: 'manual',
    });
    const pending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '晚上见。',
    });
    await completeTavernCommunicationExchange({ pendingMessage: pending, replies: ['好。'] });
    await saveTavernCommunicationSnapshot(session.id, 1);

    const branch = await branchTavernSession(session.id);
    assert.ok(branch);
    const branchId = branch?.id || '';
    const branchContacts = await listTavernCommunicationContacts(branchId);
    const branchThreads = await listTavernCommunicationThreads(branchId);
    assert.equal(branchContacts[0]?.name, '米娅');
    assert.deepEqual(
        (await listTavernCommunicationMessages(branchId, branchThreads[0]?.id || '')).map((message) => message.content),
        ['晚上见。', '好。'],
    );

    const latePending = await appendPendingTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '这条不应该在删除后复活。',
    });
    assert.equal(await deleteTavernSession(session.id), 1);
    assert.deepEqual(await completeTavernCommunicationExchange({ pendingMessage: latePending, replies: ['迟到回复'] }), []);
    assert.deepEqual(await listTavernCommunicationContacts(session.id), []);
    assert.deepEqual(await listTavernCommunicationThreads(session.id), []);
});
