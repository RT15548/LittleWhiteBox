import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    loadTavernAssistantChatUnitPage,
    loadTavernAssistantMessageThoughts,
    loadTavernAssistantToolTurnDetail,
    projectTavernAssistantChatUnits,
} from '../app-src/features/assistant-chat/assistant-chat-projection';
import db, {
    appendTavernAssistantChatMessages,
    createTavernSession,
    getLatestTavernAssistantChatUserMessageAtOrBefore,
    getNextTavernAssistantChatUserOrderAfter,
    getTavernAssistantChatMessage,
    listTavernAssistantChatMessageOrdersFrom,
    listTavernAssistantChatMessageOrdersInRange,
    listTavernAssistantChatMessages,
    listTavernAssistantChatMessagesBefore,
    listTavernAssistantChatMessagesInRange,
} from '../shared/session-db';

async function resetDatabase() {
    await db.delete();
    await db.open();
}

test('assistant chat projection pages by complete UI units without exposing raw protocol payloads', async () => {
    await resetDatabase();
    const session = await createTavernSession({ title: 'Assistant projection' });
    const providerMarker = `provider-${'p'.repeat(64_000)}`;
    const argumentMarker = `argument-${'a'.repeat(64_000)}`;
    const resultMarker = `source-${'r'.repeat(64_000)}`;
    const records = await appendTavernAssistantChatMessages(session.id, [
        { role: 'user', content: 'u0' },
        { role: 'assistant', content: 'a0' },
        { role: 'user', content: 'u1' },
        { role: 'assistant', content: 'a1' },
        { role: 'user', content: 'u2' },
        {
            role: 'assistant',
            content: '先读取状态。',
            thoughts: [{ label: '分析', text: '需要读取当前状态。' }],
            providerPayload: { providerMarker },
            toolCalls: [{ id: 'read-state', name: 'Read', arguments: JSON.stringify({ filePath: 'memory/state.md', argumentMarker }) }],
        },
        {
            role: 'tool',
            content: JSON.stringify({ ok: true, content: resultMarker }),
            toolCallId: 'read-state',
            toolName: 'Read',
            toolDisplay: {
                status: 'resolved',
                path: 'memory/state.md',
                elapsedMs: 1250,
                summary: '已读取会话状态。',
            },
        },
        {
            role: 'assistant',
            content: '再写入摘要。',
            thoughts: [{ label: '分析', text: '只写入整理后的摘要。' }],
            toolCalls: [{ id: 'write-summary', name: 'Write', arguments: JSON.stringify({ filePath: 'memory/summary.md', argumentMarker }) }],
        },
        {
            role: 'tool',
            content: JSON.stringify({ ok: true, content: resultMarker }),
            toolCallId: 'write-summary',
            toolName: 'Write',
            toolDisplay: {
                status: 'resolved',
                path: 'memory/summary.md',
                elapsedMs: 800,
                summary: '摘要已写入。',
            },
        },
        { role: 'assistant', content: '状态已经整理完成。' },
        { role: 'user', content: 'u3' },
        { role: 'assistant', content: 'a3', thoughts: [{ label: '结论', text: '最后一条思考。' }] },
    ]);

    const page = await loadTavernAssistantChatUnitPage(session.id, {
        limit: 5,
        rawBatchSize: 2,
    });

    assert.equal(page.items.length, 5);
    assert.equal(page.hasMore, true);
    assert.deepEqual(page.items.map((item) => item.kind), [
        'message',
        'tool-turn',
        'message',
        'message',
        'message',
    ]);
    assert.equal(page.items[0]?.kind === 'message' ? page.items[0].content : '', 'u2');
    const toolTurn = page.items.find((item) => item.kind === 'tool-turn');
    assert.ok(toolTurn && toolTurn.kind === 'tool-turn');
    assert.equal(toolTurn.roundCount, 2);
    assert.equal(toolTurn.toolCount, 2);
    assert.deepEqual(toolTurn.toolNames, ['Read', 'Write']);
    assert.equal(toolTurn.summary, '摘要已写入。');

    const serializedPage = JSON.stringify(page);
    assert.equal(serializedPage.includes(providerMarker), false);
    assert.equal(serializedPage.includes(argumentMarker), false);
    assert.equal(serializedPage.includes(resultMarker), false);
    assert.equal(serializedPage.includes('providerPayload'), false);
    assert.equal(serializedPage.includes('arguments'), false);

    const detail = await loadTavernAssistantToolTurnDetail(toolTurn);
    assert.ok(detail);
    assert.equal(detail.rounds.length, 2);
    assert.equal(detail.rounds[0]?.preface, '先读取状态。');
    assert.equal(detail.rounds[0]?.thoughts[0]?.text, '需要读取当前状态。');
    assert.equal(detail.rounds[0]?.calls[0]?.path, 'memory/state.md');
    assert.equal(detail.rounds[0]?.calls[0]?.elapsedMs, 1250);
    assert.equal(detail.rounds[1]?.calls[0]?.summary, '摘要已写入。');
    const serializedDetail = JSON.stringify(detail);
    assert.equal(serializedDetail.includes(providerMarker), false);
    assert.equal(serializedDetail.includes(argumentMarker), false);
    assert.equal(serializedDetail.includes(resultMarker), false);

    const olderPage = await loadTavernAssistantChatUnitPage(session.id, {
        beforeOrder: page.nextBeforeOrder ?? undefined,
        limit: 20,
        rawBatchSize: 2,
    });
    assert.equal(olderPage.hasMore, false);
    assert.deepEqual(olderPage.items.map((item) => item.kind === 'message' ? item.content : item.kind), [
        'u0',
        'a0',
        'u1',
        'a1',
    ]);

    const stored = await listTavernAssistantChatMessages(session.id);
    assert.equal(JSON.stringify(stored).includes(providerMarker), true);
    assert.equal(JSON.stringify(stored).includes(argumentMarker), true);
    assert.equal(JSON.stringify(stored).includes(resultMarker), true);
    assert.equal((await getTavernAssistantChatMessage(session.id, records[5]!.order))?.providerPayload !== undefined, true);
    assert.deepEqual(
        (await listTavernAssistantChatMessagesBefore(session.id, records[9]!.order, 3)).map((message) => message.order),
        [records[6]!.order, records[7]!.order, records[8]!.order],
    );
    assert.deepEqual(
        (await listTavernAssistantChatMessagesInRange(session.id, records[5]!.order, records[8]!.order)).map((message) => message.order),
        [records[5]!.order, records[6]!.order, records[7]!.order, records[8]!.order],
    );
    assert.deepEqual(
        await listTavernAssistantChatMessageOrdersFrom(session.id, records[9]!.order),
        [records[9]!.order, records[10]!.order, records[11]!.order],
    );
    assert.equal(
        (await getLatestTavernAssistantChatUserMessageAtOrBefore(session.id, records[9]!.order))?.order,
        records[4]!.order,
    );
    assert.equal(await getNextTavernAssistantChatUserOrderAfter(session.id, records[4]!.order), records[10]!.order);
    assert.deepEqual(
        await listTavernAssistantChatMessageOrdersInRange(session.id, records[5]!.order, records[9]!.order),
        records.slice(5, 10).map((record) => record.order),
    );
    assert.deepEqual(await loadTavernAssistantMessageThoughts(session.id, records[11]!.order), [
        { label: '结论', text: '最后一条思考。' },
    ]);
});

test('assistant chat projection treats failed tool drafts as ordinary assistant messages', async () => {
    await resetDatabase();
    const session = await createTavernSession({ title: 'Assistant failed draft projection' });
    const messages = await appendTavernAssistantChatMessages(session.id, [
        { role: 'user', content: '停一下。' },
        {
            role: 'assistant',
            content: '已停止。',
            finishReason: 'aborted',
            toolCalls: [{ id: 'draft-read', name: 'Read', arguments: '{"raw":"should-not-project"}' }],
        },
        {
            role: 'assistant',
            content: 'provider failed',
            error: true,
            finishReason: 'error',
            toolCalls: [{ id: 'draft-write', name: 'Write', arguments: '{"raw":"should-not-project"}' }],
        },
    ]);

    const units = projectTavernAssistantChatUnits(messages);
    assert.equal(units.length, 3);
    assert.equal(units.every((item) => item.kind === 'message'), true);
    assert.equal(JSON.stringify(units).includes('should-not-project'), false);
});

test('assistant chat projection changes UI identity when a rerun replaces the same order', () => {
    const original = projectTavernAssistantChatUnits([{
        sessionId: 'session-1',
        order: 7,
        role: 'assistant',
        content: '相同回复',
        thoughts: [{ label: '旧思考', text: '旧内容' }],
        createdAt: 1000,
        updatedAt: 1000,
    }]);
    const replacement = projectTavernAssistantChatUnits([{
        sessionId: 'session-1',
        order: 7,
        role: 'assistant',
        content: '相同回复',
        thoughts: [{ label: '新思考', text: '新内容' }],
        createdAt: 2000,
        updatedAt: 2000,
    }]);

    assert.equal(original[0]?.startOrder, replacement[0]?.startOrder);
    assert.notEqual(original[0]?.key, replacement[0]?.key);
    assert.notEqual(original[0]?.anchorKey, replacement[0]?.anchorKey);
});

test('assistant tool details give repeated protocol ids distinct display identities', async () => {
    await resetDatabase();
    const session = await createTavernSession({ title: 'Repeated assistant tool ids' });
    await appendTavernAssistantChatMessages(session.id, [
        { role: 'assistant', content: '第一轮', toolCalls: [{ id: 'shared-id', name: 'Read', arguments: '{}' }] },
        { role: 'tool', content: '{"ok":true}', toolCallId: 'shared-id', toolName: 'Read', toolDisplay: { summary: '第一轮完成' } },
        { role: 'assistant', content: '第二轮', toolCalls: [{ id: 'shared-id', name: 'Write', arguments: '{}' }] },
        { role: 'tool', content: '{"ok":true}', toolCallId: 'shared-id', toolName: 'Write', toolDisplay: { summary: '第二轮完成' } },
    ]);

    const [unit] = (await loadTavernAssistantChatUnitPage(session.id, { limit: 5 })).items;
    assert.ok(unit && unit.kind === 'tool-turn');
    const detail = await loadTavernAssistantToolTurnDetail(unit);
    const calls = detail?.rounds.flatMap((round) => round.calls) || [];
    assert.deepEqual(calls.map((call) => call.protocolId), ['shared-id', 'shared-id']);
    assert.equal(new Set(calls.map((call) => call.displayKey)).size, 2);
    assert.deepEqual(calls.map((call) => call.summary), ['第一轮完成', '第二轮完成']);
});

test('assistant chat paging preserves requested windows larger than one hundred units', async () => {
    await resetDatabase();
    const session = await createTavernSession({ title: 'Large assistant projection window' });
    await appendTavernAssistantChatMessages(
        session.id,
        Array.from({ length: 130 }, (_, index) => ({ role: 'user' as const, content: `u${index}` })),
    );

    const page = await loadTavernAssistantChatUnitPage(session.id, {
        limit: 125,
        rawBatchSize: 32,
    });
    assert.equal(page.items.length, 125);
    assert.equal(page.hasMore, true);
    assert.equal(page.items[0]?.kind === 'message' ? page.items[0].content : '', 'u5');
    const lastItem = page.items.at(-1);
    assert.equal(lastItem?.kind === 'message' ? lastItem.content : '', 'u129');
});

test('assistant chat paging keeps a long tool turn whole across raw database batches', async () => {
    await resetDatabase();
    const session = await createTavernSession({ title: 'Cross-batch assistant tool turn' });
    await appendTavernAssistantChatMessages(session.id, [
        { role: 'user', content: 'older-boundary' },
        ...Array.from({ length: 10 }, (_, index) => ([
            {
                role: 'assistant' as const,
                content: `round-${index + 1}`,
                toolCalls: [{ id: `tool-${index + 1}`, name: 'Read', arguments: '{}' }],
            },
            {
                role: 'tool' as const,
                content: '{"ok":true}',
                toolCallId: `tool-${index + 1}`,
                toolName: 'Read',
                toolDisplay: { summary: `resolved-${index + 1}` },
            },
        ])).flat(),
        { role: 'assistant', content: 'final-answer' },
        { role: 'user', content: 'follow-up' },
        { role: 'assistant', content: 'follow-up-answer' },
        { role: 'user', content: 'latest-question' },
    ]);

    const page = await loadTavernAssistantChatUnitPage(session.id, {
        limit: 5,
        rawBatchSize: 2,
    });
    assert.equal(page.items.length, 5);
    assert.equal(page.hasMore, true);
    const toolTurn = page.items[0];
    assert.ok(toolTurn && toolTurn.kind === 'tool-turn');
    assert.equal(toolTurn.roundCount, 10);
    assert.equal(toolTurn.toolCount, 10);
    assert.equal(toolTurn.summary, 'resolved-10');

    const olderPage = await loadTavernAssistantChatUnitPage(session.id, {
        beforeOrder: page.nextBeforeOrder ?? undefined,
        limit: 20,
        rawBatchSize: 2,
    });
    assert.deepEqual(olderPage.items.map((item) => item.kind === 'message' ? item.content : item.kind), [
        'older-boundary',
    ]);
});
