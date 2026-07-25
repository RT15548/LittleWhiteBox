import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import db, {
    appendTavernAssistantChatMessage as appendTavernManagerMessage,
    appendTavernMessage,
    createTavernManagerRun,
    createTavernSession,
    getLatestTavernMessage,
    getTavernManagerCandidate,
    getSelectedTavernSessionId,
    listTavernAssistantChatMessages as listTavernManagerMessages,
    listTavernManagerRuns,
    listTavernMessages,
    listTavernSessions,
    putTavernManagerCandidate,
    tavernManagerMemorySnapshotsTable,
    tavernManagerStateSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemoryIndexesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
    tavernShopStateVersionsTable,
} from '../shared/session-db';
import {
    exportTavernCharacterArchive,
    restoreTavernCharacterArchiveFromRecords,
} from '../shared/character-archive-db';
import {
    parseTavernCharacterArchiveJsonlBatches,
    parseTavernCharacterArchiveJsonl,
    sha256Hex,
    TavernCharacterArchiveWriter,
    textToBytes,
    type TavernCharacterArchiveJsonlCodec,
} from '../shared/character-archive-jsonl';
import {
    buildTavernCharacterArchiveCharacterHash,
    buildTavernCharacterArchivePartFilename,
    downloadTavernCharacterArchiveFile,
    downloadTavernCharacterArchiveManifest,
} from '../shared/character-archive-server-storage';
import {
    CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION,
    type TavernCharacterArchiveManifest,
    type TavernCharacterArchiveRecord,
} from '../shared/character-archive-types';
import {
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import { replaceTavernTaskBoard } from '../shared/tasks/task-board';
import { captureTavernTaskPhoneBoundary } from '../shared/tasks/task-phone-boundary';
import {
    publishTavernTask,
    updateTavernTaskCandidates,
} from '../shared/tasks/task-service';
import { TAVERN_TASK_CURRENT_MARKER } from '../shared/tasks/task-types';
import { captureTavernPhoneBoundary } from '../shared/phone-boundary';
import {
    activateTavernShopItem,
    getCurrentTavernShopState,
    purchaseTavernShopItem,
} from '../shared/shop/shop-service';
import { TAVERN_SHOP_CURRENT_MARKER } from '../shared/shop/shop-types';
import {
    appendSentTavernCommunicationMessage,
    completeTavernCommunicationReply,
    createTavernCommunicationContact,
    listTavernCommunicationContacts,
    listTavernCommunicationMessages,
    listTavernCommunicationThreads,
    saveTavernCommunicationSnapshot,
} from '../shared/communications';
import { tavernCommunicationPayloadText } from '../shared/communication-message';
import { executeTavernMemoryTool } from '../shared/memory-files';

const identityCodec: TavernCharacterArchiveJsonlCodec = {
    gzip: async (bytes) => bytes,
    ungzip: async (bytes) => bytes,
};

async function spendArchiveWallet(sessionId: string, idempotencyKey: string, amount: number, anchorOrder = 0) {
    return await postTavernEconomyTransaction({
        sessionId,
        idempotencyKey,
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount,
        kind: 'archive_test_spend',
        title: '归档测试支出',
        sourceDomain: 'test',
        sourceId: idempotencyKey,
        anchorOrder,
    });
}

async function seedArchiveTasks(sessionId: string, prefix = 'archive') {
    const generationId = `${prefix}-board-1`;
    const taskId = `${prefix}-published-task`;
    const boundary = await captureTavernTaskPhoneBoundary(sessionId);
    const listingBlueprints = [
        ['E', 10, '替钟表匠送一枚停摆齿轮'],
        ['D', 30, '查清夜班渡船少掉的一名乘客'],
        ['C', 80, '护送一箱会模仿哭声的矿石'],
        ['B', 180, '替死人签收一只封蜡箱'],
        ['A', 420, '从无主领馆取回失踪印玺'],
        ['S', 900, '阻止天空列车驶入废弃站台'],
    ] as const;
    await replaceTavernTaskBoard({
        sessionId,
        generationId,
        expectedRevision: 0,
        expectedEpoch: 1,
        boundary,
        listings: listingBlueprints.map(([grade, reward, title], index) => ({
            id: `${prefix}-listing-${index + 1}`,
            grade,
            tags: index % 2 ? ['调查'] : ['委托'],
            title,
            issuer: {
                id: `${prefix}-issuer-${index + 1}`,
                name: `陌生委托人 ${index + 1}`,
                description: '只在地下委托终端留下单向联络暗号。',
            },
            hook: '委托表面简单，但有一条刻意被遮住的附注。',
            objective: `完成第 ${index + 1} 项可执行目标并带回可信结果。`,
            location: `旧城区 ${index + 1} 号节点`,
            risk: '不得把委托内容交给无关人物。',
            reward,
        })),
        generatedAt: 20,
    });
    const published = await publishTavernTask({
        sessionId,
        taskId,
        actionId: `${prefix}-publish-action`,
        title: '寻找不留下倒影的向导',
        objective: '带领委托人穿过镜廊并确认出口仍然存在。',
        requirements: '不得破坏镜廊内的任何镜面。',
        location: '北门镜廊',
        risk: '向导可能在途中失去自己的倒影。',
        reward: 60,
        grade: 'CUSTOM',
        tags: ['公开招募', '向导'],
        boundary,
    });
    await updateTavernTaskCandidates({
        sessionId,
        taskId,
        expectedRevision: published.revision,
        expectedVersionId: published.versionId,
        actionId: `${prefix}-candidate-action`,
        candidates: [
            { id: `${prefix}-candidate-1`, name: '弥娅', description: '被协会除名的前遗物鉴定师', pitch: '她声称不需要进入目标建筑。', capability: '远程鉴定与伪造手续', risk: '拒绝解释自己为何认识保管人' },
            { id: `${prefix}-candidate-2`, name: '壳匠', description: '以替身机关代替本人行动的工匠', pitch: '愿意先交一具试作替身。', capability: '机关侦察与危险路径试探', risk: '替身偶尔会隐瞒见闻' },
            { id: `${prefix}-candidate-3`, name: '无灯修女', description: '从不携带光源的地下引路人', pitch: '她熟悉镜廊关闭后的第二条路。', capability: '黑暗环境导航与异常规避', risk: '要求带走途中发现的一件无名遗物' },
        ],
        boundary,
    });
}

async function seedArchiveShop(sessionId: string) {
    const latest = await getLatestTavernMessage(sessionId);
    await postTavernEconomyTransaction({
        sessionId,
        idempotencyKey: 'archive:shop-top-up',
        fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: 2_000,
        kind: 'archive_test_top_up',
        title: '归档测试充值',
        sourceDomain: 'test',
        sourceId: 'archive:shop-top-up',
        anchorOrder: Number(latest?.order ?? -1) + 1,
    });
    const boundary = await captureTavernPhoneBoundary(sessionId);
    const cas = async () => {
        const current = await getCurrentTavernShopState(sessionId);
        return {
            expectedRevision: current?.revision ?? 0,
            expectedVersionId: current?.versionId ?? '',
        };
    };
    await purchaseTavernShopItem({
        sessionId,
        itemId: 'flower',
        actionId: 'archive-buy-flower',
        boundary,
        ...(await cas()),
    });
    await purchaseTavernShopItem({
        sessionId,
        itemId: 'absolute-obedience',
        actionId: 'archive-buy-obedience',
        boundary,
        ...(await cas()),
    });
    await activateTavernShopItem({
        sessionId,
        itemId: 'absolute-obedience',
        parameters: { targetName: '艾拉' },
        actionId: 'archive-use-obedience',
        boundary,
        ...(await cas()),
    });
}

async function seedArchiveSource() {
    await db.delete();
    await db.open();
    const a1 = await createTavernSession({
        id: 'a-session-1',
        title: 'A one',
        characterKey: 'char-a',
        characterName: 'Aster',
        contextSnapshot: { character: { characterKey: 'char-a', name: 'Aster' } },
    });
    const a2 = await createTavernSession({
        id: 'a-session-2',
        title: 'A two',
        characterKey: 'char-a',
        characterName: 'Aster',
        contextSnapshot: { character: { characterKey: 'char-a', name: 'Aster' } },
    });
    const b1 = await createTavernSession({
        id: 'b-session-1',
        title: 'B one',
        characterKey: 'char-b',
        characterName: 'Beryl',
        contextSnapshot: { character: { characterKey: 'char-b', name: 'Beryl' } },
    });
    for (let index = 0; index < 24; index += 1) {
        await appendTavernMessage(a1.id, { role: index % 2 ? 'assistant' : 'user', content: `a1 message ${index}` });
    }
    await appendTavernMessage(a2.id, { role: 'user', content: 'latest user' });
    await appendTavernMessage(b1.id, { role: 'user', content: 'other character message' });
    await spendArchiveWallet(a1.id, 'archive:a1-spend', 15, 1);
    await spendArchiveWallet(a2.id, 'archive:a2-spend', 5);
    await spendArchiveWallet(b1.id, 'archive:b1-spend', 7);
    await appendTavernManagerMessage(a1.id, { role: 'assistant', content: 'manager says hi' });
    const run = await createTavernManagerRun({
        id: 'run-a-1',
        sessionId: a1.id,
        turn: 1,
        userOrder: 0,
        assistantOrder: 1,
        trigger: 'after_turn',
        status: 'completed',
    });
    await putTavernManagerCandidate({
        sessionId: a1.id,
        turn: 12,
        userOrder: 22,
        assistantOrder: 23,
        inputSummary: 'archive candidate',
    });
    await tavernMemoryFilesTable.put({
        sessionId: a1.id,
        path: 'memory/state.md',
        content: 'memory for a',
        status: 'active',
        source: 'user',
        createdAt: 1,
        updatedAt: 2,
    });
    await tavernMemorySnapshotsTable.put({
        sessionId: a1.id,
        floor: 1,
        files: [{
            path: 'memory/state.md',
            file: {
                sessionId: a1.id,
                path: 'memory/state.md',
                content: 'snapshot memory',
                status: 'active',
                createdAt: 1,
                updatedAt: 2,
            },
        }],
        createdAt: 3,
    });
    await tavernMemoryIndexesTable.put({
        sessionId: a1.id,
        kind: 'markdown-derived',
        status: 'ready',
        updatedAt: 4,
        files: [],
    });
    await tavernManagerMemorySnapshotsTable.put({
        managerRunId: run.id,
        sessionId: a1.id,
        path: 'memory/state.md',
        beforeExists: true,
        beforeFile: {
            sessionId: a1.id,
            path: 'memory/state.md',
            content: 'before memory',
            status: 'active',
            createdAt: 1,
            updatedAt: 1,
        },
        beforeHash: 'before-memory',
        afterHash: 'after-memory',
        rollbackStatus: 'pending',
        createdAt: 5,
        updatedAt: 6,
    });
    await tavernStateDocumentsTable.put({
        sessionId: a1.id,
        docType: 'tavern.map',
        docId: 'map-main',
        title: 'Map',
        revision: 7,
        data: { rooms: [{ id: 'hall' }] },
        digest: 'map-digest',
        status: 'active',
        source: 'test',
        createdAt: 7,
        updatedAt: 8,
    });
    await tavernStatePatchesTable.put({
        id: 'patch-a-1',
        sessionId: a1.id,
        docType: 'tavern.map',
        docId: 'map-main',
        revision: 8,
        status: 'active',
        managerRunId: run.id,
        ops: [{ op: 'add', id: 'hall' }],
        createdAt: 9,
        updatedAt: 10,
    });
    await tavernManagerStateSnapshotsTable.put({
        managerRunId: run.id,
        sessionId: a1.id,
        docType: 'tavern.map',
        docId: 'map-main',
        beforeExists: true,
        beforeDocument: {
            sessionId: a1.id,
            docType: 'tavern.map',
            docId: 'map-main',
            title: 'Map',
            revision: 6,
            data: { rooms: [] },
            digest: 'before-map',
            status: 'active',
            createdAt: 1,
            updatedAt: 1,
        },
        beforeHash: 'before-map',
        afterHash: 'after-map',
        rollbackStatus: 'pending',
        createdAt: 11,
        updatedAt: 12,
    });
    const { thread } = await createTavernCommunicationContact({
        sessionId: a1.id,
        name: 'Phone Contact',
        source: 'manual',
    });
    const phoneMessage = await appendSentTavernCommunicationMessage({
        sessionId: a1.id,
        threadId: thread.id,
        payload: { type: 'text', text: 'phone hello' },
    });
    await completeTavernCommunicationReply({
        userMessage: phoneMessage.message,
        replyRequestId: phoneMessage.replyRequest.id,
        replies: [{ type: 'text', text: 'phone reply' }],
    });
    await appendSentTavernCommunicationMessage({
        sessionId: a1.id,
        threadId: thread.id,
        payload: { type: 'text', text: 'phone interrupted' },
    });
    await saveTavernCommunicationSnapshot(a1.id, 1);
    await seedArchiveTasks(a1.id);
    await seedArchiveTasks(b1.id, 'other-character');
    await seedArchiveShop(a1.id);
    await tavernSessionsTable.update(a1.id, { updatedAt: 1000 });
    await tavernSessionsTable.update(a2.id, { updatedAt: 3000 });
    await tavernSessionsTable.update(b1.id, { updatedAt: 4000 });
    return { a1, a2, b1 };
}

async function buildArchive(characterKey = 'char-a', targetRawBytes = 420) {
    const uploadedParts: Array<{ filename: string; bytes: Uint8Array }> = [];
    const archiveId = 'archive-test';
    const writer = new TavernCharacterArchiveWriter({
        archiveId,
        targetRawBytes,
        forceRawBytes: targetRawBytes * 2,
        codec: identityCodec,
        filenameForPart: (index) => buildTavernCharacterArchivePartFilename('character-hash-test', archiveId, index),
        uploadPart: async (part) => {
            uploadedParts.push({ filename: part.filename, bytes: part.bytes });
        },
    });
    const summary = await exportTavernCharacterArchive({
        archiveId,
        character: { characterKey, name: 'Aster', avatar: 'avatar.png', nativeCharacterId: '0' },
        writer,
    });
    const writerResult = await writer.close();
    const manifest: TavernCharacterArchiveManifest = {
        version: CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION,
        archiveId,
        complete: true,
        exportedAt: summary.exportedAt,
        character: summary.character,
        counts: summary.counts,
        parts: writerResult.parts,
    };
    const records = uploadedParts.flatMap((part) => parseTavernCharacterArchiveJsonl(part.bytes));
    return { manifest, records, uploadedParts };
}

async function restoreFromRecords(manifest: TavernCharacterArchiveManifest, records: TavernCharacterArchiveRecord[]) {
    return await restoreTavernCharacterArchiveFromRecords({
        manifest,
        characterKey: manifest.character.characterKey,
        jobId: 'job-test',
        recordBatches: (async function* batches() {
            yield records;
        })(),
    });
}

test('tavern character archive backup includes only the current character and creates multiple parts', async () => {
    await seedArchiveSource();
    const { manifest, records, uploadedParts } = await buildArchive('char-a', 380);

    assert(uploadedParts.length > 1);
    assert.equal(manifest.counts.sessions, 2);
    assert.equal(manifest.counts.messages, 25);
    assert.equal(manifest.counts.memoryFiles, 1);
    assert.equal(manifest.counts.stateDocuments, 5);
    assert.equal(manifest.counts.communications, 6);
    assert.equal(manifest.counts.economy, 15);
    assert.equal(manifest.counts.tasks, 3);
    assert.equal(manifest.counts.shop, 3);
    assert(uploadedParts.every((part) => part.filename.includes('_archive-test_part_')));
    assert(!records.some((row) => JSON.stringify(row.record).includes('char-b')));
    assert(!records.some((row) => JSON.stringify(row.record).includes('b-session-1')));
    assert(records.some((row) => row.table === 'communicationContacts'));
    assert(records.some((row) => row.table === 'communicationThreads'));
    assert(records.some((row) => row.table === 'communicationMessages'));
    assert(records.some((row) => row.table === 'communicationSnapshots'));
    assert.equal(records.filter((row) => row.table === 'economyAccounts').length, 7);
    assert.equal(records.filter((row) => row.table === 'economyTransactions').length, 8);
    assert.equal(records.filter((row) => row.table === 'taskBoards').length, 1);
    assert.equal(records.filter((row) => row.table === 'taskVersions').length, 2);
    assert.equal(records.filter((row) => row.table === 'shopStateVersions').length, 3);
    assert.equal(records.filter((row) => row.table === 'economyTransactions'
        && String((row.record as { kind?: string }).kind || '') === 'shop_purchase').length, 2);
    assert.equal(
        (records.find((row) => row.table === 'taskVersions' && Number((row.record as { revision?: number }).revision) === 2)?.record as { candidates?: unknown[] } | undefined)?.candidates?.length,
        3,
    );
});

test('tavern character archive refuses every session when another tab has an unaccepted manager write', async () => {
    const { a2 } = await seedArchiveSource();
    const run = await createTavernManagerRun({
        sessionId: a2.id,
        turn: 1,
        userOrder: 0,
        assistantOrder: 1,
        status: 'running',
        leaseOwnerId: 'other-tab',
        leaseExpiresAt: Date.now() + 30000,
    });
    const partialWrite = await executeTavernMemoryTool(a2.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: 'unaccepted archive write',
    }, { caller: 'auto', managerRunId: run.id });
    assert.equal(partialWrite.ok, true);
    const written: TavernCharacterArchiveRecord[] = [];

    await assert.rejects(exportTavernCharacterArchive({
        archiveId: 'archive-busy-test',
        character: { characterKey: 'char-a', name: 'Aster', avatar: '', nativeCharacterId: '0' },
        writer: { write: async (record) => {written.push(record);} },
    }), /manager_archive_unaccepted_writes/);
    assert.equal(written.length, 0);
});

test('tavern character archive part filenames are scoped by archive id', () => {
    const previous = buildTavernCharacterArchivePartFilename('hash-a', 'archive-old', 1);
    const next = buildTavernCharacterArchivePartFilename('hash-a', 'archive-new', 1);

    assert.notEqual(previous, next);
    assert.equal(previous, 'LWB_TavernCharacterArchive_hash-a_archive-old_part_0001.jsonl.gz');
    assert.equal(next, 'LWB_TavernCharacterArchive_hash-a_archive-new_part_0001.jsonl.gz');
});

test('tavern character archive hashes do not depend on browser WebCrypto', async () => {
    assert.equal(
        await sha256Hex(textToBytes('')),
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    assert.equal(
        await sha256Hex(textToBytes('abc')),
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    assert.equal(
        await buildTavernCharacterArchiveCharacterHash('abc'),
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    const edgeSizes = [55, 56, 57, 63, 64, 65, 127, 128, 129, 4099];
    for (const size of edgeSizes) {
        const bytes = new Uint8Array(size);
        for (let index = 0; index < bytes.length; index += 1) {
            bytes[index] = index % 251;
        }
        assert.equal(await sha256Hex(bytes), createHash('sha256').update(bytes).digest('hex'));
    }
});

test('tavern character archive source does not call browser crypto APIs', () => {
    const jsonlSource = readFileSync(new URL('../shared/character-archive-jsonl.ts', import.meta.url), 'utf8');
    const storageSource = readFileSync(new URL('../shared/character-archive-server-storage.ts', import.meta.url), 'utf8');
    const dbSource = readFileSync(new URL('../shared/character-archive-db.ts', import.meta.url), 'utf8');
    const appSource = readFileSync(new URL('../app-src/App.vue', import.meta.url), 'utf8');
    const archiveSource = `${jsonlSource}\n${storageSource}\n${dbSource}\n${appSource}`;

    assert(!archiveSource.includes('crypto.subtle'));
    assert(!archiveSource.includes('crypto_subtle_unavailable'));
    assert(!archiveSource.includes('globalThis.crypto'));
    assert(!jsonlSource.includes('paddedLength'));
    assert(!jsonlSource.includes('padded.set(input)'));
    assert(jsonlSource.includes('DEFAULT_SHA256_YIELD_BLOCKS'));
    assert(jsonlSource.includes('yieldMainThread'));
});

test('tavern character archive JSONL parser yields bounded batches', () => {
    const rows: Array<TavernCharacterArchiveRecord<'sessions'>> = Array.from({ length: 5 }, (_, index) => ({
        table: 'sessions',
        record: {
            id: `session-${index}`,
            title: `Session ${index}`,
            characterKey: 'char-a',
            characterName: 'Aster',
            createdAt: index,
            updatedAt: index,
            storyTimelineRevision: 1,
            taskBoardEpoch: 1,
        },
    }));
    const raw = textToBytes(rows.map((row) => JSON.stringify(row)).join('\n'));
    const batches = Array.from(parseTavernCharacterArchiveJsonlBatches(raw, 2));
    const parsedRows = batches.flat() as Array<TavernCharacterArchiveRecord<'sessions'>>;

    assert.deepEqual(batches.map((batch) => batch.length), [2, 2, 1]);
    assert.deepEqual(parsedRows.map((row) => row.record.id), rows.map((row) => row.record.id));
});

test('tavern character archive JSONL parser streams decoder chunks across multibyte lines', () => {
    const rows: Array<TavernCharacterArchiveRecord<'memoryFiles'>> = Array.from({ length: 3 }, (_, index) => ({
        table: 'memoryFiles',
        record: {
            sessionId: 'session-a',
            path: `memory/${index}.md`,
            content: `中文内容-${index}`,
            status: 'active',
            createdAt: index,
            updatedAt: index,
        },
    }));
    const raw = textToBytes(`${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
    const batches = Array.from(parseTavernCharacterArchiveJsonlBatches(raw, 2, 5));
    const parsedRows = batches.flat() as Array<TavernCharacterArchiveRecord<'memoryFiles'>>;

    assert.deepEqual(batches.map((batch) => batch.length), [2, 1]);
    assert.deepEqual(parsedRows.map((row) => row.record.content), rows.map((row) => row.record.content));
});

test('tavern character archive JSONL parser rejects unknown tables', () => {
    assert.throws(
        () => parseTavernCharacterArchiveJsonl(textToBytes(JSON.stringify({ table: 'unknownDomain', record: {} }))),
        /archive_jsonl_table_unsupported:unknownDomain/,
    );
});

test('tavern character archive export handles records beyond one DB page without skipping', async () => {
    await db.delete();
    await db.open();
    await createTavernSession({
        id: 'paged-session',
        title: 'Paged',
        characterKey: 'char-a',
        characterName: 'Aster',
    });
    await tavernMessagesTable.bulkPut(Array.from({ length: 505 }, (_, index) => ({
        messageId: `message-${index}`,
        sessionId: 'paged-session',
        order: index,
        role: index % 2 ? 'assistant' : 'user',
        content: `message ${index}`,
        createdAt: index,
    })));

    const { manifest, records } = await buildArchive('char-a', 1024 * 1024);

    assert.equal(manifest.counts.sessions, 1);
    assert.equal(manifest.counts.messages, 505);
    assert.equal(records.filter((row) => row.table === 'messages').length, 505);
});

test('tavern character archive export does not use Dexie each without writer backpressure', () => {
    const source = readFileSync(new URL('../shared/character-archive-db.ts', import.meta.url), 'utf8');

    assert(!source.includes('chain = chain.then'));
    assert(!source.includes('.each('));
});

test('tavern character archive restore replaces only the current character and remaps linked records', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    await db.delete();
    await db.open();
    await createTavernSession({ id: 'old-a', title: 'old', characterKey: 'char-a', characterName: 'Aster' });
    await appendTavernMessage('old-a', { role: 'user', content: 'old local message' });
    await spendArchiveWallet('old-a', 'archive:old-a-spend', 3);
    await putTavernManagerCandidate({ sessionId: 'old-a', turn: 1, userOrder: 0, assistantOrder: 1 });
    await createTavernSession({ id: 'keep-b', title: 'keep', characterKey: 'char-b', characterName: 'Beryl' });
    await appendTavernMessage('keep-b', { role: 'user', content: 'keep me' });
    await spendArchiveWallet('keep-b', 'archive:keep-b-spend', 9);

    const result = await restoreFromRecords(manifest, records);
    const sessions = await listTavernSessions();
    const charASessions = sessions.filter((session) => session.characterKey === 'char-a');
    const charBSessions = sessions.filter((session) => session.characterKey === 'char-b');
    const restoredA1 = 'restore-job-test-a-session-1';
    const restoredA2 = 'restore-job-test-a-session-2';

    assert.deepEqual(charASessions.map((session) => session.id).sort(), [restoredA1, restoredA2]);
    assert.deepEqual(charBSessions.map((session) => session.id), ['keep-b']);
    assert.equal((await listTavernMessages('keep-b'))[0]?.content, 'keep me');
    assert.equal((await listTavernMessages('old-a')).length, 0);
    assert.equal(await getTavernManagerCandidate('old-a'), null);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals('old-a').count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('old-a').count(), 0);
    assert.equal((await tavernEconomyAccountsTable.get(['keep-b', TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 91);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('keep-b').count(), 2);
    assert.equal((await listTavernMessages(restoredA1)).length, 24);
    assert.equal((await listTavernManagerMessages(restoredA1))[0]?.content, 'manager says hi');
    assert.equal((await listTavernManagerRuns(restoredA1))[0]?.id, 'restore-job-test-run-a-1');
    const restoredCandidate = await getTavernManagerCandidate(restoredA1);
    assert.match(restoredCandidate?.id || '', /^restore-job-test-manager-candidate-/);
    assert.equal(restoredCandidate?.assistantOrder, 23);
    assert.equal((await tavernMemoryFilesTable.get([restoredA1, 'memory/state.md']))?.content, 'memory for a');
    assert.equal((await tavernStateDocumentsTable.get([restoredA1, 'tavern.map', 'map-main']))?.digest, 'map-digest');
    assert.equal((await tavernStatePatchesTable.get('restore-job-test-patch-a-1'))?.managerRunId, 'restore-job-test-run-a-1');
    assert.equal((await tavernManagerMemorySnapshotsTable.get(['restore-job-test-run-a-1', 'memory/state.md']))?.sessionId, restoredA1);
    assert.equal((await tavernManagerStateSnapshotsTable.get(['restore-job-test-run-a-1', 'tavern.map', 'map-main']))?.sessionId, restoredA1);
    const restoredPhoneContacts = await listTavernCommunicationContacts(restoredA1);
    const restoredPhoneThreads = await listTavernCommunicationThreads(restoredA1);
    assert.equal(restoredPhoneContacts[0]?.name, 'Phone Contact');
    assert.deepEqual(
        (await listTavernCommunicationMessages(restoredA1, restoredPhoneThreads[0]?.id || '')).map((message) => [tavernCommunicationPayloadText(message.payload), message.status]),
        [
            ['phone hello', 'sent'],
            ['phone reply', 'sent'],
            ['phone interrupted', 'sent'],
        ],
    );
    assert.equal(restoredPhoneThreads[0]?.replyRequest?.status, 'failed');
    assert.equal((await tavernEconomyAccountsTable.get([restoredA1, TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 775);
    assert.equal((await tavernEconomyAccountsTable.get([restoredA2, TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 95);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(restoredA1).count(), 4);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(restoredA1).count(), 6);
    assert.equal((await tavernEconomyTransactionsTable.where('[sessionId+idempotencyKey]').equals([
        restoredA1,
        'archive:a1-spend',
    ]).toArray())[0]?.sourceId, 'archive:a1-spend');
    const restoredTaskBoard = await tavernTaskBoardsTable.get(restoredA1);
    const restoredTaskVersions = await tavernTaskVersionsTable.where('sessionId').equals(restoredA1).toArray();
    assert.equal(restoredTaskBoard?.generationId, 'archive-board-1');
    assert.equal(restoredTaskBoard?.listings.length, 6);
    assert.equal(restoredTaskBoard?.listings[3]?.title, '替死人签收一只封蜡箱');
    assert.equal(restoredTaskVersions.length, 2);
    assert.equal(restoredTaskVersions.find((version) => version.currentMarker === TAVERN_TASK_CURRENT_MARKER)?.revision, 2);
    const restoredCurrentTask = restoredTaskVersions.find((version) => version.currentMarker === TAVERN_TASK_CURRENT_MARKER);
    const restoredEscrow = await tavernEconomyAccountsTable.get([restoredA1, restoredCurrentTask?.escrowAccountId || '']);
    assert.equal(restoredEscrow?.kind, 'escrow');
    assert.equal(restoredEscrow?.balance, 60);
    const restoredTaskFundingRows = await tavernEconomyTransactionsTable
        .where('sessionId')
        .equals(restoredA1)
        .toArray();
    assert.equal(restoredTaskFundingRows.filter((transaction) => transaction.kind === 'task_escrow').length, 1);
    const restoredTaskFunding = restoredTaskFundingRows.find((transaction) => transaction.kind === 'task_escrow');
    assert.equal(restoredTaskFunding?.sourceDomain, 'tasks');
    assert.equal(restoredTaskFunding?.sourceId, restoredCurrentTask?.taskId);
    assert.equal(restoredTaskFunding?.fromAccountId, TAVERN_PLAYER_ACCOUNT_ID);
    assert.equal(restoredTaskFunding?.toAccountId, restoredCurrentTask?.escrowAccountId);
    assert.equal(restoredTaskFunding?.amount, restoredCurrentTask?.reward);
    assert.deepEqual(
        restoredTaskVersions.find((version) => version.revision === 2)?.candidates.map((candidate) => candidate.name),
        ['弥娅', '壳匠', '无灯修女'],
    );
    const restoredShopVersions = await tavernShopStateVersionsTable.where('sessionId').equals(restoredA1).toArray();
    assert.equal(restoredShopVersions.length, 3);
    const restoredShopCurrent = restoredShopVersions.find((version) => version.currentMarker === TAVERN_SHOP_CURRENT_MARKER);
    assert.equal(restoredShopCurrent?.revision, 3);
    assert.equal(restoredShopCurrent?.state.items.flower.quantity, 1);
    assert.equal(restoredShopCurrent?.state.items['absolute-obedience'].quantity, 0);
    assert.equal(restoredShopCurrent?.state.items['absolute-obedience'].activations.length, 1);
    assert.equal(restoredShopCurrent?.state.items['absolute-obedience'].activations[0]?.parameters.targetName, '艾拉');
    assert.equal(restoredShopCurrent?.state.items['absolute-obedience'].activations[0]?.startsAtTurn, 0);
    assert.equal(await getSelectedTavernSessionId(), restoredA2);
    assert.equal(result.selectedSessionId, restoredA2);
});

test('tavern character archive accepts only the current v6 protocol', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const retiredV5Manifest = {
        ...manifest,
        version: 5,
    } as unknown as TavernCharacterArchiveManifest;
    const retiredV4Manifest = {
        ...manifest,
        version: 4,
    } as unknown as TavernCharacterArchiveManifest;

    await assert.rejects(restoreFromRecords(retiredV5Manifest, records), /archive_version_unsupported:5/);
    await assert.rejects(restoreFromRecords(retiredV4Manifest, records), /archive_version_unsupported:4/);
});

test('tavern character archive rejects broken task funding before promotion', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const brokenRecords = records.map((row) => {
        if (row.table !== 'economyTransactions' || String((row.record as { kind?: string }).kind || '') !== 'task_escrow') {
            return row;
        }
        return {
            ...row,
            record: {
                ...row.record,
                amount: Number((row.record as { amount?: number }).amount) + 1,
            },
        } as TavernCharacterArchiveRecord;
    });
    await db.delete();
    await db.open();

    await assert.rejects(restoreFromRecords(manifest, brokenRecords), /archive_task_funding_invalid/);
    assert.equal((await listTavernSessions()).length, 0);
});

test('tavern character archive rejects live manager records instead of restoring partial writes', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const liveRecords = records.map((row) => row.table === 'managerRuns'
        ? {
            ...row,
            record: {
                ...row.record,
                status: 'running' as const,
                leaseOwnerId: 'archived-tab',
                leaseExpiresAt: Date.now() + 60000,
            },
        }
        : row) as TavernCharacterArchiveRecord[];
    await db.delete();
    await db.open();

    await assert.rejects(restoreFromRecords(manifest, liveRecords), /archive_manager_run_unaccepted/);
    assert.equal((await listTavernSessions()).length, 0);
});

test('tavern character archive restore failure leaves the current local archive unchanged', async () => {
    const { a1 } = await seedArchiveSource();
    await tavernMessagesTable.bulkPut(Array.from({ length: 500 }, (_, offset) => ({
        messageId: `archive-failure-message-${offset}`,
        sessionId: a1.id,
        order: offset + 24,
        role: offset % 2 ? 'assistant' : 'user',
        content: `archive failure message ${offset}`,
        createdAt: offset + 100,
        timelineRevision: 1,
    })));
    const { manifest, records } = await buildArchive('char-a', 500);
    await db.delete();
    await db.open();
    await createTavernSession({ id: 'old-a', title: 'old', characterKey: 'char-a', characterName: 'Aster' });
    await appendTavernMessage('old-a', { role: 'user', content: 'old local message' });
    await spendArchiveWallet('old-a', 'archive:failure-old-a', 2);
    await createTavernSession({ id: 'keep-b', title: 'keep', characterKey: 'char-b', characterName: 'Beryl' });
    await spendArchiveWallet('keep-b', 'archive:failure-keep-b', 4);
    const firstEconomyRecordIndex = records.findIndex((record) => record.table === 'economyTransactions');
    assert(firstEconomyRecordIndex >= 0);
    const stagedRecords = [
        records[firstEconomyRecordIndex],
        ...records.filter((_record, index) => index !== firstEconomyRecordIndex).slice(0, 499),
    ];
    assert.equal(stagedRecords.length, 500);

    await assert.rejects(
        restoreTavernCharacterArchiveFromRecords({
            manifest,
            characterKey: 'char-a',
            jobId: 'bad-job',
            recordBatches: (async function* batches() {
                yield stagedRecords;
                throw new Error('archive_part_sha256_mismatch:part-2.jsonl.gz');
            })(),
        }),
        /archive_part_sha256_mismatch/,
    );

    const sessions = await listTavernSessions();
    assert(sessions.some((session) => session.id === 'old-a' && session.characterKey === 'char-a'));
    assert(sessions.some((session) => session.id === 'keep-b' && session.characterKey === 'char-b'));
    assert.equal((await listTavernMessages('old-a'))[0]?.content, 'old local message');
    assert(!sessions.some((session) => session.id.startsWith('restore-bad-job-')));
    assert.equal((await tavernEconomyAccountsTable.get(['old-a', TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 98);
    assert.equal((await tavernEconomyAccountsTable.get(['keep-b', TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 96);
    const allEconomyAccounts = await (tavernEconomyAccountsTable as unknown as {
        toArray(): Promise<Array<{ sessionId: string }>>;
    }).toArray();
    const allEconomyTransactions = await (tavernEconomyTransactionsTable as unknown as {
        toArray(): Promise<Array<{ sessionId: string }>>;
    }).toArray();
    assert(!allEconomyAccounts.some((account) => account.sessionId.startsWith('restore-bad-job-')));
    assert(!allEconomyTransactions.some((transaction) => transaction.sessionId.startsWith('restore-bad-job-')));
});

test('tavern character archive rejects a normally-ended incomplete stream before promotion', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    await db.delete();
    await db.open();
    await createTavernSession({ id: 'old-a', title: 'old', characterKey: 'char-a', characterName: 'Aster' });
    await appendTavernMessage('old-a', { role: 'user', content: 'keep local archive' });

    await assert.rejects(
        restoreTavernCharacterArchiveFromRecords({
            manifest,
            characterKey: 'char-a',
            jobId: 'incomplete-job',
            recordBatches: (async function* batches() {
                yield records.slice(0, 1);
            })(),
        }),
        /archive_row_count_mismatch/,
    );

    assert.equal((await listTavernMessages('old-a'))[0]?.content, 'keep local archive');
    assert(!((await listTavernSessions()).some((session) => session.id.startsWith('restore-incomplete-job-'))));
});

test('tavern character archive cleans session-scoped temp rows that have no restored session', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const economyAccount = records.find((record) => record.table === 'economyAccounts');
    assert(economyAccount);
    const orphanManifest: TavernCharacterArchiveManifest = {
        ...manifest,
        counts: {
            sessions: 0,
            messages: 0,
            memoryFiles: 0,
            stateDocuments: 0,
            communications: 0,
            economy: 1,
            tasks: 0,
            shop: 0,
        },
        parts: [{
            ...manifest.parts[0],
            index: 1,
            rowCount: 1,
        }],
    };
    await db.delete();
    await db.open();

    await assert.rejects(
        restoreTavernCharacterArchiveFromRecords({
            manifest: orphanManifest,
            characterKey: 'char-a',
            jobId: 'orphan-job',
            recordBatches: (async function* batches() {
                yield [economyAccount];
            })(),
        }),
        /archive_session_reference_missing/,
    );

    const accounts = await (tavernEconomyAccountsTable as unknown as {
        toArray(): Promise<Array<{ sessionId: string }>>;
    }).toArray();
    assert(!accounts.some((account) => account.sessionId.startsWith('restore-orphan-job-')));
});

test('tavern character archive can restore an empty archive by clearing only the current character', async () => {
    await db.delete();
    await db.open();
    await createTavernSession({ id: 'old-a', title: 'old', characterKey: 'char-a', characterName: 'Aster' });
    await appendTavernMessage('old-a', { role: 'user', content: 'old local message' });
    await spendArchiveWallet('old-a', 'archive:empty-old-a', 6);
    await createTavernSession({ id: 'keep-b', title: 'keep', characterKey: 'char-b', characterName: 'Beryl' });
    await appendTavernMessage('keep-b', { role: 'user', content: 'keep me' });
    await spendArchiveWallet('keep-b', 'archive:empty-keep-b', 8);
    const manifest: TavernCharacterArchiveManifest = {
        version: CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION,
        archiveId: 'empty-archive',
        complete: true,
        exportedAt: 123,
        character: { characterKey: 'char-a', name: 'Aster' },
        counts: {
            sessions: 0,
            messages: 0,
            memoryFiles: 0,
            stateDocuments: 0,
            communications: 0,
            economy: 0,
            tasks: 0,
            shop: 0,
        },
        parts: [],
    };

    const result = await restoreTavernCharacterArchiveFromRecords({
        manifest,
        characterKey: 'char-a',
        jobId: 'empty-job',
        recordBatches: (async function* batches(): AsyncIterable<TavernCharacterArchiveRecord[]> {
            yield [];
        })(),
    });
    const sessions = await listTavernSessions();

    assert.equal(result.selectedSessionId, '');
    assert.equal(await getSelectedTavernSessionId(), '');
    assert(!sessions.some((session) => session.characterKey === 'char-a'));
    assert(sessions.some((session) => session.id === 'keep-b' && session.characterKey === 'char-b'));
    assert.equal((await listTavernMessages('keep-b'))[0]?.content, 'keep me');
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals('old-a').count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('old-a').count(), 0);
    assert.equal((await tavernEconomyAccountsTable.get(['keep-b', TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 92);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('keep-b').count(), 2);
});

test('tavern character archive downloads bypass the user file cache', async () => {
    const previousXhr = globalThis.XMLHttpRequest;
    const requests: Array<{ method: string; url: string; headers: Record<string, string> }> = [];
    class FakeArchiveDownloadXhr {
        responseType = '';
        response: ArrayBuffer = new Uint8Array([1, 2, 3]).buffer;
        status = 200;
        responseText = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        onprogress: ((event: { loaded: number; total: number; lengthComputable: boolean }) => void) | null = null;
        private method = '';
        private url = '';
        private headers: Record<string, string> = {};

        open(method: string, url: string) {
            this.method = method;
            this.url = url;
        }

        setRequestHeader(key: string, value: string) {
            this.headers[key] = value;
        }

        send() {
            requests.push({ method: this.method, url: this.url, headers: this.headers });
            this.onprogress?.({ loaded: 3, total: 3, lengthComputable: true });
            this.onload?.();
        }
    }
    globalThis.XMLHttpRequest = FakeArchiveDownloadXhr as unknown as typeof XMLHttpRequest;
    try {
        const bytes = await downloadTavernCharacterArchiveFile('archive.jsonl.gz', { headers: { 'X-CSRF-Token': 'test' } });
        assert.deepEqual(Array.from(bytes), [1, 2, 3]);
        assert.equal(requests[0]?.method, 'GET');
        assert.match(requests[0]?.url || '', /^\/user\/files\/archive\.jsonl\.gz\?v=\d+$/);
        assert.equal(requests[0]?.headers['Cache-Control'], 'no-cache');
        assert.equal(requests[0]?.headers.Pragma, 'no-cache');
        assert.equal(requests[0]?.headers['X-CSRF-Token'], 'test');
    } finally {
        globalThis.XMLHttpRequest = previousXhr;
    }
});

test('tavern character archive manifest treats missing user file body as no backup', async () => {
    const previousXhr = globalThis.XMLHttpRequest;
    class FakeMissingManifestDownloadXhr {
        responseType = '';
        response: ArrayBuffer = new Uint8Array(textToBytes('Not Found')).buffer;
        status = 200;
        responseText = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        onprogress: ((event: { loaded: number; total: number; lengthComputable: boolean }) => void) | null = null;

        open() {
            // no-op
        }

        setRequestHeader() {
            // no-op
        }

        send() {
            this.onprogress?.({ loaded: 9, total: 9, lengthComputable: true });
            this.onload?.();
        }
    }
    globalThis.XMLHttpRequest = FakeMissingManifestDownloadXhr as unknown as typeof XMLHttpRequest;
    try {
        await assert.rejects(
            downloadTavernCharacterArchiveManifest('character-hash-test'),
            /archive_manifest_missing/,
        );
    } finally {
        globalThis.XMLHttpRequest = previousXhr;
    }
});

test('tavern character archive manifest handles arraybuffer 404 without hanging', async () => {
    const previousXhr = globalThis.XMLHttpRequest;
    class FakeMissingManifest404Xhr {
        responseType = '';
        response: ArrayBuffer = new Uint8Array(textToBytes('Not Found')).buffer;
        status = 404;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        onprogress: ((event: { loaded: number; total: number; lengthComputable: boolean }) => void) | null = null;

        get responseText(): string {
            throw new Error('InvalidStateError: responseText is not accessible for arraybuffer');
        }

        open() {
            // no-op
        }

        setRequestHeader() {
            // no-op
        }

        send() {
            this.responseType = 'arraybuffer';
            this.onprogress?.({ loaded: 9, total: 9, lengthComputable: true });
            this.onload?.();
        }
    }
    globalThis.XMLHttpRequest = FakeMissingManifest404Xhr as unknown as typeof XMLHttpRequest;
    try {
        await assert.rejects(
            downloadTavernCharacterArchiveManifest('character-hash-test'),
            /archive_manifest_missing/,
        );
    } finally {
        globalThis.XMLHttpRequest = previousXhr;
    }
});

test('tavern character archive rejects unknown shop items before promotion', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const brokenRecords = records.map((row) => {
        if (row.table !== 'shopStateVersions' || Number((row.record as { revision?: number }).revision) !== 3) {
            return row;
        }
        const record = row.record as unknown as { state: { items: Record<string, unknown> } };
        return {
            ...row,
            record: {
                ...row.record,
                state: {
                    items: {
                        ...record.state.items,
                        'not-a-catalog-item': { itemId: 'not-a-catalog-item', quantity: 1, activations: [] },
                    },
                },
            },
        } as TavernCharacterArchiveRecord;
    });
    await db.delete();
    await db.open();

    await assert.rejects(restoreFromRecords(manifest, brokenRecords), /archive_shop_item_unknown/);
    assert.equal((await listTavernSessions()).length, 0);
});

test('tavern character archive rejects shop activation parameters outside the catalog contract', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const brokenRecords = records.map((row) => {
        if (row.table !== 'shopStateVersions' || Number((row.record as { revision?: number }).revision) !== 3) {
            return row;
        }
        const record = JSON.parse(JSON.stringify(row.record)) as {
            state: { items: Record<string, { activations: Array<{ parameters: Record<string, string> }> }> };
        };
        record.state.items['absolute-obedience'].activations[0].parameters.injected = '额外字段';
        return { ...row, record } as TavernCharacterArchiveRecord;
    });
    await db.delete();
    await db.open();

    await assert.rejects(restoreFromRecords(manifest, brokenRecords), /archive_shop_parameters_invalid/);
    assert.equal((await listTavernSessions()).length, 0);
});

test('tavern character archive rejects a broken shop current marker before promotion', async () => {
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    const brokenRecords = records.map((row) => {
        if (row.table !== 'shopStateVersions' || Number((row.record as { revision?: number }).revision) !== 3) {
            return row;
        }
        return {
            ...row,
            record: {
                ...row.record,
                currentMarker: undefined,
            },
        } as TavernCharacterArchiveRecord;
    });
    await db.delete();
    await db.open();

    await assert.rejects(restoreFromRecords(manifest, brokenRecords), /archive_shop_current_marker_invalid/);
    assert.equal((await listTavernSessions()).length, 0);
});
