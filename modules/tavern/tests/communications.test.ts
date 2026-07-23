import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    appendTavernMessage,
    tavernCommunicationSnapshotsTable,
    tavernCommunicationThreadsTable,
} from '../shared/session-db';
import {
    appendSentTavernCommunicationMessage as appendSentTavernCommunicationPayload,
    completeTavernCommunicationReply,
    createTavernCommunicationContact,
    describeTavernCommunicationRestoreImpact,
    failTavernCommunicationReplyRequest,
    listTavernCommunicationContacts,
    listTavernCommunicationMessages,
    listTavernCommunicationTimelineEvents,
    listTavernCommunicationThreads,
    markTavernCommunicationThreadRead,
    reconcileTavernCommunicationContacts,
    recoverInterruptedTavernCommunicationReplyRequests,
    restoreTavernCommunicationsToFloor,
    retryTavernCommunicationReplyRequest,
    saveTavernCommunicationSnapshot,
    touchTavernCommunicationReplyRequest,
    trimTavernCommunicationSnapshotsFromFloor,
} from '../shared/communications';
import { tavernCommunicationPayloadText } from '../shared/communication-message';
import { buildTavernMessagesRequestMessages } from '../app-src/features/phone-os/apps/messages/tavern-messages-context';
import { buildTavernAutomaticCommunicationContacts } from '../app-src/features/phone-os/apps/messages/tavern-messages-contacts';
import { buildTavernPhonePromptMessages } from '../app-src/features/phone-os/apps/messages/tavern-messages-prompt';
import {
    extractBalancedJsonObjects,
    parseTavernPhoneReply,
} from '../app-src/features/phone-os/apps/messages/tavern-messages-response';
import { XBTavernWorldPosition, type ActivatedWorldEntry } from '../shared/message-assembler';
import type { TavernGetNativeWorldInfoRuntime } from '../app-src/runtime/run-once';

function activatedPhoneWorldEntry(content: string, position: XBTavernWorldPosition, depth = 0): ActivatedWorldEntry {
    return {
        uid: `world-${position}-${depth}`,
        activationKey: `world-${position}-${depth}`,
        content,
        key: [],
        keysecondary: [],
        decorators: [],
        position,
        role: 'system',
        order: 0,
        depth,
        activationReason: 'test',
        sourceWorldBook: 'test',
        contentChars: content.length,
    };
}

function longPhonePromptValue(label: string): string {
    return `${label}_START\n{{${label}_PLACEHOLDER}}\n${'x'.repeat(12_050)}\n${label}_END`;
}

function textPayload(text: string) {
    return { type: 'text' as const, text };
}

function appendSentTavernCommunicationMessage(input: { sessionId: string; threadId: string; content: string }) {
    return appendSentTavernCommunicationPayload({
        sessionId: input.sessionId,
        threadId: input.threadId,
        payload: textPayload(input.content),
    });
}

type PreparedPhoneReplyRequest = Awaited<ReturnType<typeof appendSentTavernCommunicationMessage>>;

function completePhoneReply(
    prepared: PreparedPhoneReplyRequest,
    input: Omit<Parameters<typeof completeTavernCommunicationReply>[0], 'userMessage' | 'replyRequestId'> = {},
) {
    return completeTavernCommunicationReply({
        ...input,
        ...(input.replies ? {
            replies: input.replies.map((reply) => typeof reply === 'string' ? textPayload(reply) : reply),
        } : {}),
        userMessage: prepared.message,
        replyRequestId: prepared.replyRequest.id,
    });
}

function failPhoneReply(
    prepared: PreparedPhoneReplyRequest,
    error: unknown,
) {
    return failTavernCommunicationReplyRequest(prepared.message, prepared.replyRequest.id, error);
}

test('phone reply parser skips ordinary JSON and uses the first protocol-valid balanced object', () => {
    const value = [
        '前置说明里有一个坏花括号：{not json}',
        '普通上下文对象：{"note":"不是消息协议"}',
        '```json',
        '{"result":"reply","messages":[{"type":"text","text":"字符串里的 { 花括号 } 不截断"}],"summary":"已回复"}',
        '```',
        '尾部还有 {"ignored":true}',
    ].join('\n');

    assert.deepEqual(extractBalancedJsonObjects(value), [{ note: '不是消息协议' }, {
        result: 'reply',
        messages: [{ type: 'text', text: '字符串里的 { 花括号 } 不截断' }],
        summary: '已回复',
    }, { ignored: true }]);
    assert.deepEqual(parseTavernPhoneReply(value), {
        result: 'reply',
        messages: [{ type: 'text', text: '字符串里的 { 花括号 } 不截断' }],
        summary: '已回复',
    });
});

test('phone reply parser accepts text, voice, and image payloads without inventing a channel', () => {
    const payload = parseTavernPhoneReply(JSON.stringify({
        result: 'reply',
        messages: [
            { type: 'text', text: '你先别过来。' },
            { type: 'voice', transcript: '雨太大了，我去接你。', emotion: '担心' },
            {
                type: 'image',
                description: '车站入口被暴雨淹没的现场照片。',
                generationPrompt: 'flooded station entrance, heavy rain, night, documentary photo',
            },
        ],
    }));

    assert.deepEqual(payload.messages, [
        { type: 'text', text: '你先别过来。' },
        { type: 'voice', transcript: '雨太大了，我去接你。', emotion: '担心' },
        {
            type: 'image',
            description: '车站入口被暴雨淹没的现场照片。',
            generationPrompt: 'flooded station entrance, heavy rain, night, documentary photo',
        },
    ]);
    assert.equal(JSON.stringify(payload).includes('channel'), false);
});

test('phone reply parser rejects prose when no complete valid JSON object exists', () => {
    assert.throws(
        () => parseTavernPhoneReply('前缀 {"note":"只是普通对象"}，后面也没有消息协议。'),
        /消息协议/,
    );
});

test('phone contact discovery only exposes active NPC memory files', () => {
    const contacts = buildTavernAutomaticCommunicationContacts([
        { path: 'memory/characters/艾琳.md', status: 'active' },
        { path: 'memory/characters/艾琳.md', status: 'active' },
        { path: 'memory/characters/旧时间线.md', status: 'stale' },
        { path: 'memory/characters/USER.md', status: 'active' },
        { path: 'memory/characters/旁白.md', status: 'active' },
        { path: 'memory/characters/世界模拟器.md', status: 'active' },
        { path: 'memory/characters/小白.md', status: 'active' },
        { path: 'memory/state.md', status: 'active' },
    ], {
        character: { name: '世界模拟器' },
        user: { name: '小白' },
    });

    assert.deepEqual(contacts, [
        { name: '艾琳', memoryPath: 'memory/characters/艾琳.md' },
    ]);
});

test('phone contact reconciliation preserves valid threads and removes experimental contact branches', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Automatic contacts' });
    const legacyCharacter = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '世界模拟器',
        source: 'character',
    });
    const legacyManual = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '手动联系人',
        source: 'manual',
    });
    const existingNpc = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        memoryPath: 'memory/characters/艾琳.md',
        source: 'memory',
    });
    await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: existingNpc.thread.id,
        content: '保留这条通讯',
    });
    await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: legacyManual.thread.id,
        content: '删除这条通讯',
    });

    await reconcileTavernCommunicationContacts({
        sessionId: session.id,
        contacts: [
            { name: '艾琳', memoryPath: 'memory/characters/艾琳.md' },
            { name: '诺拉', memoryPath: 'memory/characters/诺拉.md' },
        ],
    });

    const contacts = await listTavernCommunicationContacts(session.id);
    const threads = await listTavernCommunicationThreads(session.id);
    assert.deepEqual(contacts.map((contact) => [contact.name, contact.source, contact.memoryPath]).sort(), [
        ['艾琳', 'memory', 'memory/characters/艾琳.md'],
        ['诺拉', 'memory', 'memory/characters/诺拉.md'],
    ]);
    assert.equal(contacts.find((contact) => contact.name === '艾琳')?.id, existingNpc.contact.id);
    assert.equal(threads.length, 2);
    assert.equal(tavernCommunicationPayloadText((await listTavernCommunicationMessages(session.id, existingNpc.thread.id))[0]!.payload), '保留这条通讯');
    assert.deepEqual(await listTavernCommunicationMessages(session.id, legacyCharacter.thread.id), []);
    assert.deepEqual(await listTavernCommunicationMessages(session.id, legacyManual.thread.id), []);
});

test('phone persistence rejects a second pending reply request in the same thread', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone concurrent send' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '并发联系人',
        source: 'manual',
    });

    const results = await Promise.allSettled([
        appendSentTavernCommunicationMessage({ sessionId: session.id, threadId: thread.id, content: '第一条并发消息' }),
        appendSentTavernCommunicationMessage({ sessionId: session.id, threadId: thread.id, content: '第二条并发消息' }),
    ]);

    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    assert.match(String(rejected?.reason?.message || rejected?.reason || ''), /communication_reply_request_pending/);
    const messages = await listTavernCommunicationMessages(session.id, thread.id);
    const storedThread = (await listTavernCommunicationThreads(session.id))[0];
    assert.equal(messages.length, 1);
    assert.equal(messages[0]?.status, 'sent');
    assert.equal(storedThread?.replyRequest?.status, 'pending');
    assert.equal(storedThread?.replyRequest?.userSequence, messages[0]?.sequence);
    assert.equal(await recoverInterruptedTavernCommunicationReplyRequests(session.id), 0);
    await assert.rejects(
        appendSentTavernCommunicationMessage({
            sessionId: session.id,
            threadId: thread.id,
            content: '另一标签页不能借恢复逻辑覆盖活跃请求',
        }),
        /communication_reply_request_pending/,
    );
});

test('phone message replies persist unread state until the thread is opened', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone unread', characterName: 'Aster' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        source: 'memory',
    });
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '在吗？',
    });
    await completePhoneReply(sent, {
        replies: ['在。', '刚看到。'],
        result: 'reply',
        unreadCountDelta: 2,
    });
    assert.equal((await listTavernCommunicationThreads(session.id))[0]?.unreadCount, 2);
    await markTavernCommunicationThreadRead(session.id, thread.id);
    assert.equal((await listTavernCommunicationThreads(session.id))[0]?.unreadCount, 0);
});

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
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '你在哪？',
    });
    await completePhoneReply(sent, {
        replies: [
            { type: 'voice', transcript: '我还在车站。', emotion: '急促' },
            {
                type: 'image',
                description: '车站入口被暴雨淹没的现场照片。',
                generationPrompt: 'flooded station entrance, heavy rain, documentary photo',
            },
        ],
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
    assert.deepEqual(messages.map((message) => [message.role, message.payload, message.status]), [
        ['user', { type: 'text', text: '你在哪？' }, 'sent'],
        ['contact', { type: 'voice', transcript: '我还在车站。', emotion: '急促' }, 'sent'],
        ['contact', {
            type: 'image',
            description: '车站入口被暴雨淹没的现场照片。',
            generationPrompt: 'flooded station entrance, heavy rain, documentary photo',
        }, 'sent'],
    ]);
    assert.deepEqual(messages.map((message) => message.anchorOrder), [1, 1, 1]);

    const events = await listTavernCommunicationTimelineEvents(session.id, {
        fromAnchorOrder: 1,
        toAnchorOrder: 1,
        playerName: '林晚',
    });
    assert.equal(events.length, 1);
    assert.equal(events[0]?.anchorOrder, 1);
    assert.match(String(events[0]?.content || ''), /^\[林晚 与 艾琳 的私人消息 · 发生于剧情此刻\]/);
    assert.match(String(events[0]?.content || ''), /林晚（文字）：你在哪？/);
    assert.match(String(events[0]?.content || ''), /艾琳（语音）：我还在车站/);
    assert.match(String(events[0]?.content || ''), /艾琳（图片）：车站入口被暴雨淹没的现场照片/);
    assert.doesNotMatch(String(events[0]?.content || ''), /flooded station entrance/);
    assert.doesNotMatch(String(events[0]?.content || ''), /参与者：|只有参与者天然知道|不表示对应现场行动已经完成|phone_communication_event|私人短信|玩家：/);
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
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '在吗？',
    });
    await completePhoneReply(sent, {
        result: 'silent',
        replies: ['这条不应该落库'],
        summary: '玩家尝试联系，对方未回复。',
    });

    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => [message.role, tavernCommunicationPayloadText(message.payload)]),
        [['user', '在吗？']],
    );
    const storedThread = (await listTavernCommunicationThreads(session.id))[0];
    assert.equal(storedThread?.lastResult, 'silent');
    assert.equal(storedThread?.summary, '玩家尝试联系，对方未回复。');
});

test('failed phone reply requests preserve the sent user bubble and retry its original anchor', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone retry' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '伊芙',
        source: 'manual',
    });
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '重试这一条',
    });
    assert.equal((await listTavernCommunicationMessages(session.id, thread.id))[0]?.status, 'sent');
    assert.equal((await listTavernCommunicationThreads(session.id))[0]?.replyRequest?.status, 'pending');
    const failedThread = await failPhoneReply(sent, new Error('network'));
    assert.equal(sent.message.status, 'sent');
    assert.equal(failedThread?.replyRequest?.status, 'failed');
    await appendTavernMessage(session.id, { role: 'user', content: '剧情已经继续。' });
    const retried = await retryTavernCommunicationReplyRequest(session.id, thread.id);
    const messages = await listTavernCommunicationMessages(session.id, thread.id);

    assert.equal(retried.message.sequence, sent.message.sequence);
    assert.equal(retried.message.anchorOrder, sent.message.anchorOrder);
    assert.equal(retried.message.status, 'sent');
    assert.equal(retried.replyRequest.status, 'pending');
    assert.equal(retried.replyRequest.anchorOrder, sent.message.anchorOrder);
    assert.notEqual(retried.replyRequest.id, sent.replyRequest.id);
    assert.equal(await completeTavernCommunicationReply({
        userMessage: sent.message,
        replyRequestId: sent.replyRequest.id,
        replies: ['旧尝试的迟到回复'],
    }), null);
    assert.equal(messages.length, 1);
    assert.equal(messages[0]?.status, 'sent');
});

test('sending after a failed reply request keeps the earlier message and starts a new request', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone retry after later messages' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '伊芙',
        source: 'manual',
    });
    const first = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '较早失败消息',
    });
    await failPhoneReply(first, new Error('network'));
    const later = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '后续正常消息',
    });
    await completePhoneReply(later, {
        replies: ['后续正常回复'],
    });

    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => [message.sequence, tavernCommunicationPayloadText(message.payload), message.status]),
        [
            [0, '较早失败消息', 'sent'],
            [1, '后续正常消息', 'sent'],
            [2, '后续正常回复', 'sent'],
        ],
    );
    assert.equal((await listTavernCommunicationThreads(session.id))[0]?.replyRequest, undefined);
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
    const first = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '第一条',
    });
    await completePhoneReply(first, { replies: ['收到'] });
    await saveTavernCommunicationSnapshot(session.id, 2);
    const second = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '第二条',
    });
    await completePhoneReply(second, { replies: ['稍后见'] });

    const impact = await describeTavernCommunicationRestoreImpact(session.id, 2);
    assert.equal(impact.changed, true);
    assert.equal(impact.currentMessageCount, 4);
    assert.equal(impact.targetMessageCount, 2);

    await restoreTavernCommunicationsToFloor(session.id, 2);
    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => tavernCommunicationPayloadText(message.payload)),
        ['第一条', '收到'],
    );
    assert.equal(await completePhoneReply(second, { replies: ['迟到回复'] }), null);
    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, thread.id)).map((message) => tavernCommunicationPayloadText(message.payload)),
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

test('phone snapshots, recovery, and branching turn interrupted reply requests into retryable failures', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone interrupted' });
    const { thread } = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '中断联系人',
        source: 'manual',
    });
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '这条请求会中断。',
    });
    const snapshot = await saveTavernCommunicationSnapshot(session.id, 1);
    assert.equal(snapshot?.messages[0]?.status, 'sent');
    assert.equal(snapshot?.threads[0]?.replyRequest?.status, 'failed');

    const branch = await branchTavernSession(session.id);
    assert.ok(branch);
    const branchThread = (await listTavernCommunicationThreads(branch?.id || ''))[0];
    assert.equal((await listTavernCommunicationMessages(branch?.id || '', branchThread?.id || ''))[0]?.status, 'sent');
    assert.equal(branchThread?.replyRequest?.status, 'failed');

    assert.equal(await recoverInterruptedTavernCommunicationReplyRequests(session.id), 0);
    const pendingThread = (await listTavernCommunicationThreads(session.id))[0];
    assert.ok(pendingThread?.replyRequest);
    await tavernCommunicationThreadsTable.put({
        ...pendingThread!,
        replyRequest: {
            ...pendingThread!.replyRequest!,
            leaseExpiresAt: 0,
        },
    });
    assert.equal(await touchTavernCommunicationReplyRequest({
        sessionId: session.id,
        threadId: thread.id,
        replyRequestId: sent.replyRequest.id,
    }), true);
    assert.equal(await recoverInterruptedTavernCommunicationReplyRequests(session.id), 0);
    const renewedThread = (await listTavernCommunicationThreads(session.id))[0];
    await tavernCommunicationThreadsTable.put({
        ...renewedThread!,
        replyRequest: {
            ...renewedThread!.replyRequest!,
            leaseExpiresAt: 0,
        },
    });
    assert.equal(await recoverInterruptedTavernCommunicationReplyRequests(session.id), 1);
    assert.equal((await listTavernCommunicationMessages(session.id, thread.id))[0]?.status, 'sent');
    assert.equal((await listTavernCommunicationThreads(session.id))[0]?.replyRequest?.status, 'failed');
    assert.equal(await completePhoneReply(sent, { replies: ['迟到回复'] }), null);
});

test('reopening a phone thread after the main story advances creates a new timeline anchor', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Phone timeline anchors' });
    const contact = await createTavernCommunicationContact({ sessionId: session.id, name: '艾琳', source: 'manual' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '第一处剧情位置。' });
    const first = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '第一段通讯。',
    });
    await completePhoneReply(first, { replies: ['第一段回复。'] });
    await appendTavernMessage(session.id, { role: 'user', content: '剧情继续。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '抵达第二处位置。' });
    const second = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '第二段通讯。',
    });
    await completePhoneReply(second, { replies: ['第二段回复。'] });

    assert.deepEqual(
        (await listTavernCommunicationMessages(session.id, contact.thread.id)).map((message) => message.anchorOrder),
        [0, 0, 2, 2],
    );
    assert.deepEqual(
        (await listTavernCommunicationTimelineEvents(session.id)).map((event) => event.anchorOrder),
        [0, 2],
    );
});

test('phone generation uses the main-story native worldbook at its anchor and a real final user turn', async () => {
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
            worldEntries: [{
                uid: 'phone-local-reactivation-must-not-run',
                key: ['现在剧情进行到哪里了'],
                content: 'LOCAL_PHONE_REACTIVATION_BAD',
                position: XBTavernWorldPosition.before,
            }],
        },
    });
    const contact = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        memoryPath: 'memory/characters/艾琳.md',
        source: 'memory',
    });
    const earlier = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '之前的手机消息。',
    });
    await completePhoneReply(earlier, {
        replies: ['之前的手机回复。'],
        summary: '艾琳答应保持联系。',
    });
    for (let order = 0; order < 26; order += 1) {
        await appendTavernMessage(session.id, {
            role: order % 2 === 0 ? 'user' : 'assistant',
            content: `main-history-${order}`,
            ...(order === 24 ? {
                runtimeStateSnapshot: {
                    turn: 12,
                    contextWindowStartOrder: 0,
                    worldEntryStates: {},
                    nativeWorldInfoTimedState: {
                        sticky: { anchored: { hash: 24 } },
                        cooldown: {},
                    },
                },
            } : {}),
        });
    }
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        content: '现在剧情进行到哪里了？',
    });
    const currentThread = (await listTavernCommunicationThreads(session.id))
        .find((thread) => thread.id === contact.thread.id) || contact.thread;
    const fullContactProfile = longPhonePromptValue('CONTEXT_CONTACT');
    let nativeWorldbookInput: Parameters<TavernGetNativeWorldInfoRuntime>[0] | null = null;
    const requestMessages = await buildTavernMessagesRequestMessages({
        sessionId: session.id,
        contextSnapshot: session.contextSnapshot || {},
        contact: contact.contact,
        contactProfile: fullContactProfile,
        thread: currentThread,
        communicationMessages: await listTavernCommunicationMessages(session.id, contact.thread.id),
        userMessage: sent.message,
        getNativeWorldInfoRuntime: async (input) => {
            nativeWorldbookInput = input;
            return {
                trigger: input.trigger,
                worldInfoBefore: 'NATIVE_ANCHOR_WORLD_INFO',
                timedState: { sticky: {}, cooldown: {} },
            };
        },
    });
    const raw = JSON.stringify(requestMessages);
    const roleMessage = requestMessages[0];
    const settingMessage = requestMessages[1];
    const storyOpenIndex = requestMessages.findIndex((message) => message.content.startsWith('<story_history>'));
    const storyCloseIndex = requestMessages.findIndex((message) => message.content === '</story_history>');
    const currentStateIndex = requestMessages.findIndex((message) => message.content.startsWith('<current_state_and_memory>'));
    const privateMessageThreadIndex = requestMessages.findIndex((message) => message.name === 'private_message_thread');
    const finalUserTurn = requestMessages.at(-1);
    const privateMessageThread = requestMessages[privateMessageThreadIndex]?.content || '';
    const nativeWorldbookContext = nativeWorldbookInput?.context || {};

    assert.match(roleMessage?.content || '', /^<role>/);
    assert.match(roleMessage?.content || '', /不超过200字/);
    assert.match(roleMessage?.content || '', /<private_message_summary>/);
    assert.match(roleMessage?.content || '', /最后的 \[user\] turn：<incoming_private_message>/);
    assert.doesNotMatch(roleMessage?.content || '', /phone_thread_context|第 3 层最后那条/);
    assert.match(settingMessage?.content || '', /^<setting>/);
    assert.match(settingMessage?.content || '', /<character_card>[\s\S]*## Character\n艾琳[\s\S]*## User\n玩家/);
    assert.doesNotMatch(settingMessage?.content || '', /## Description/);
    assert.match(raw, /CONTEXT_CONTACT_END/);
    assert.match(raw, /\{\{CONTEXT_CONTACT_PLACEHOLDER\}\}/);
    assert.doesNotMatch(raw, /NORMAL_MAIN_CHARACTER_CARD/);
    assert.match(raw, /之前的手机消息/);
    assert.match(raw, /之前的手机回复/);
    assert.match(privateMessageThread, /<private_message_summary>\n此前通讯摘要：\n艾琳答应保持联系。\n<\/private_message_summary>/);
    assert.match(privateMessageThread, /<private_message_thread>[\s\S]*之前的手机消息[\s\S]*之前的手机回复[\s\S]*<\/private_message_thread>/);
    assert.doesNotMatch(privateMessageThread, /现在剧情进行到哪里了|incoming_private_message|较早线程摘要/);
    assert.doesNotMatch(raw, /main-history-15/);
    assert.doesNotMatch(raw, /main-history-16/);
    assert.match(raw, /main-history-17/);
    assert.match(raw, /main-history-25/);
    assert.match(raw, /main-history-24/);
    assert.match(raw, /NATIVE_ANCHOR_WORLD_INFO/);
    assert.doesNotMatch(raw, /LOCAL_PHONE_REACTIVATION_BAD/);
    assert.match(raw, /现在剧情进行到哪里了/);
    assert.equal(raw.match(/现在剧情进行到哪里了/g)?.length, 1);
    assert.equal(raw.match(/<incoming_private_message anchor_order=/g)?.length, 1);
    assert.ok(storyOpenIndex >= 0 && storyOpenIndex < storyCloseIndex);
    assert.ok(storyCloseIndex < currentStateIndex);
    assert.ok(currentStateIndex < privateMessageThreadIndex);
    assert.equal(finalUserTurn?.role, 'user');
    assert.match(finalUserTurn?.content || '', /^<incoming_private_message anchor_order="25" type="text">现在剧情进行到哪里了？<\/incoming_private_message>/);
    assert.match(finalUserTurn?.content || '', /请以「艾琳」的身份回复这条来自「玩家」的消息/);
    assert.doesNotMatch(finalUserTurn?.content || '', /回复上面|线程里最后那条/);
    assert.equal(nativeWorldbookInput?.currentUserMessage, '');
    assert.equal(nativeWorldbookInput?.trigger, 'normal');
    assert.equal(nativeWorldbookContext.character?.name, '主角色');
    assert.match(JSON.stringify(nativeWorldbookContext.history), /main-history-16/);
    assert.match(JSON.stringify(nativeWorldbookContext.history), /main-history-24|main-history-25/);
    assert.doesNotMatch(JSON.stringify(nativeWorldbookContext.history), /之前的手机消息|现在剧情进行到哪里了/);
});

test('phone prompt keeps the full contact memory once and excludes it from related-character recall', () => {
    const contact = {
        id: 'contact-erin',
        sessionId: 'session-1',
        name: '艾琳',
        memoryPath: 'memory/characters/艾琳.md',
        source: 'memory' as const,
        createdAt: 1,
        updatedAt: 1,
    };
    const thread = {
        id: 'thread-erin',
        sessionId: 'session-1',
        contactId: contact.id,
        summary: '',
        unreadCount: 0,
        createdAt: 1,
        updatedAt: 1,
    };
    const messages = buildTavernPhonePromptMessages({
        context: { user: { name: '玩家', persona: 'PLAYER_PERSONA_MARKER' } },
        contact,
        contactProfile: 'CONTACT_MEMORY_MARKER',
        thread,
        communicationMessages: [],
        mainHistory: [],
        incomingMessage: textPayload('找米娅。'),
        anchorOrder: 8,
        memoryContext: {
            memoryFiles: [
                { path: 'memory/state.md', content: 'STATE_MARKER' },
                { path: 'memory/characters/艾琳.md', content: 'CONTACT_MEMORY_MARKER' },
                { path: 'memory/characters/米娅.md', content: 'RELATED_MEMORY_MARKER' },
            ],
        },
        activatedWorldEntries: [
            activatedPhoneWorldEntry('WORLD_BEFORE_MARKER', XBTavernWorldPosition.before),
            activatedPhoneWorldEntry('WORLD_DEPTH_ONE_MARKER', XBTavernWorldPosition.atDepth, 1),
            activatedPhoneWorldEntry('WORLD_DEPTH_FOUR_MARKER', XBTavernWorldPosition.atDepth, 4),
        ],
    });
    const raw = JSON.stringify(messages);
    const setting = messages[1]?.content || '';
    const currentState = messages.find((message) => message.content.startsWith('<current_state_and_memory>'))?.content || '';

    assert.equal(raw.match(/CONTACT_MEMORY_MARKER/g)?.length, 1);
    assert.doesNotMatch(setting, /CONTACT_MEMORY_MARKER|## Description/);
    assert.match(currentState, /## 联系人本人记忆\nCONTACT_MEMORY_MARKER/);
    assert.match(currentState, /## 相关人物记忆（不含联系人本人）[\s\S]*### 米娅\nRELATED_MEMORY_MARKER/);
    assert.match(setting, /<world_info_before_character>\nWORLD_BEFORE_MARKER\n<\/world_info_before_character>/);
    assert.match(currentState, /WORLD_DEPTH_ONE_MARKER/);
    assert.doesNotMatch(currentState, /WORLD_DEPTH_FOUR_MARKER/);
    assert.ok(messages.findIndex((message) => message.content.includes('WORLD_DEPTH_FOUR_MARKER')) < messages.findIndex((message) => message.content === '</story_history>'));
    assert.equal(raw.match(/<incoming_private_message anchor_order=/g)?.length, 1);
    assert.equal(messages.at(-1)?.role, 'user');
});

test('phone prompt preserves full source content and placeholders beyond twelve thousand characters', () => {
    const contact = {
        id: 'contact-full',
        sessionId: 'session-1',
        name: '完整联系人',
        memoryPath: 'memory/characters/完整联系人.md',
        source: 'memory' as const,
        createdAt: 1,
        updatedAt: 1,
    };
    const values = Object.fromEntries([
        'PERSONA',
        'WORLD',
        'HISTORY',
        'STATE',
        'CONTACT',
        'RELATED',
        'STATUS',
        'SPATIAL',
        'DEPTH_ONE',
    ].map((label) => [label, longPhonePromptValue(label)]));
    const messages = buildTavernPhonePromptMessages({
        context: { user: { name: '玩家', persona: values.PERSONA } },
        contact,
        contactProfile: values.CONTACT,
        thread: {
            id: 'thread-full',
            sessionId: 'session-1',
            contactId: contact.id,
            unreadCount: 0,
            createdAt: 1,
            updatedAt: 1,
        },
        communicationMessages: [],
        mainHistory: [{ role: 'assistant', content: values.HISTORY }],
        incomingMessage: textPayload('在吗？'),
        anchorOrder: 1,
        memoryContext: {
            memoryFiles: [
                { path: 'memory/state.md', content: values.STATE },
                { path: 'memory/characters/相关人物.md', content: values.RELATED },
            ],
            statusPanelYaml: values.STATUS,
            spatialState: values.SPATIAL,
        },
        activatedWorldEntries: [
            activatedPhoneWorldEntry(values.WORLD, XBTavernWorldPosition.before),
            activatedPhoneWorldEntry(values.DEPTH_ONE, XBTavernWorldPosition.atDepth, 1),
        ],
    });
    const raw = JSON.stringify(messages);

    Object.keys(values).forEach((label) => {
        assert.match(raw, new RegExp(`${label}_END`));
        assert.match(raw, new RegExp(`\\{\\{${label}_PLACEHOLDER\\}\\}`));
    });
});

test('phone prompt omits the optional current-state envelope when every source is empty', () => {
    const contact = {
        id: 'contact-empty',
        sessionId: 'session-1',
        name: '空白联系人',
        memoryPath: 'memory/characters/空白联系人.md',
        source: 'memory' as const,
        createdAt: 1,
        updatedAt: 1,
    };
    const messages = buildTavernPhonePromptMessages({
        context: { user: { name: '玩家' } },
        contact,
        contactProfile: '',
        thread: {
            id: 'thread-empty',
            sessionId: 'session-1',
            contactId: contact.id,
            summary: '',
            unreadCount: 0,
            createdAt: 1,
            updatedAt: 1,
        },
        communicationMessages: [],
        mainHistory: [],
        incomingMessage: textPayload('在吗？'),
        anchorOrder: 0,
        memoryContext: {},
        activatedWorldEntries: [],
    });

    assert.equal(messages.some((message) => message.content.startsWith('<current_state_and_memory>')), false);
    assert.equal(JSON.stringify(messages).match(/<incoming_private_message anchor_order=/g)?.length, 1);
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
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '晚上见。',
    });
    await completePhoneReply(sent, { replies: ['好。'] });
    await saveTavernCommunicationSnapshot(session.id, 1);

    const branch = await branchTavernSession(session.id);
    assert.ok(branch);
    const branchId = branch?.id || '';
    const branchContacts = await listTavernCommunicationContacts(branchId);
    const branchThreads = await listTavernCommunicationThreads(branchId);
    assert.equal(branchContacts[0]?.name, '米娅');
    assert.deepEqual(
        (await listTavernCommunicationMessages(branchId, branchThreads[0]?.id || '')).map((message) => tavernCommunicationPayloadText(message.payload)),
        ['晚上见。', '好。'],
    );

    const late = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: thread.id,
        content: '这条不应该在删除后复活。',
    });
    assert.equal(await deleteTavernSession(session.id), 1);
    assert.equal(await completePhoneReply(late, { replies: ['迟到回复'] }), null);
    assert.deepEqual(await listTavernCommunicationContacts(session.id), []);
    assert.deepEqual(await listTavernCommunicationThreads(session.id), []);
});
