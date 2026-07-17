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
    getTavernManagerCandidate,
    getSelectedTavernSessionId,
    listTavernAssistantChatMessages as listTavernManagerMessages,
    listTavernManagerRuns,
    listTavernMessages,
    listTavernSessions,
    putTavernManagerCandidate,
    tavernManagerMemorySnapshotsTable,
    tavernManagerStateSnapshotsTable,
    tavernManagerTaskSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemoryIndexesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    tavernTaskFingerprintStatesTable,
    tavernTasksTable,
    tavernTaskSnapshotsTable,
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
import type {
    TavernCharacterArchiveManifest,
    TavernCharacterArchiveRecord,
} from '../shared/character-archive-types';
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
    await tavernTasksTable.put({
        id: 'task-a-1',
        sessionId: a1.id,
        status: 'active',
        title: '找线索',
        vision: '调查大厅',
        doneWhen: '找到钥匙',
        hookForModel: '继续调查',
        fingerprint: 'fp-a',
        createdOrder: 1,
        updatedOrder: 2,
        sourceManagerRunId: run.id,
        createdAt: 13,
        updatedAt: 14,
    });
    await tavernTaskSnapshotsTable.put({
        sessionId: a1.id,
        floor: 2,
        tasks: [await tavernTasksTable.get([a1.id, 'task-a-1'])].filter(Boolean) as never,
        abandonedFingerprints: ['old-fp'],
        createdAt: 15,
    });
    await tavernManagerTaskSnapshotsTable.put({
        managerRunId: run.id,
        sessionId: a1.id,
        beforeTasks: [await tavernTasksTable.get([a1.id, 'task-a-1'])].filter(Boolean) as never,
        beforeFingerprints: ['old-fp'],
        beforeHash: 'before-task',
        afterHash: 'after-task',
        rollbackStatus: 'pending',
        createdAt: 16,
        updatedAt: 17,
    });
    await tavernTaskFingerprintStatesTable.put({
        sessionId: a1.id,
        abandonedFingerprints: ['fp-abandoned'],
        updatedAt: 18,
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
        version: 1,
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
    assert.equal(manifest.counts.tasks, 1);
    assert.equal(manifest.counts.communications, 6);
    assert(uploadedParts.every((part) => part.filename.includes('_archive-test_part_')));
    assert(!records.some((row) => JSON.stringify(row.record).includes('char-b')));
    assert(!records.some((row) => JSON.stringify(row.record).includes('b-session-1')));
    assert(records.some((row) => row.table === 'communicationContacts'));
    assert(records.some((row) => row.table === 'communicationThreads'));
    assert(records.some((row) => row.table === 'communicationMessages'));
    assert(records.some((row) => row.table === 'communicationSnapshots'));
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
    await putTavernManagerCandidate({ sessionId: 'old-a', turn: 1, userOrder: 0, assistantOrder: 1 });
    await createTavernSession({ id: 'keep-b', title: 'keep', characterKey: 'char-b', characterName: 'Beryl' });
    await appendTavernMessage('keep-b', { role: 'user', content: 'keep me' });

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
    assert.equal((await listTavernMessages(restoredA1)).length, 24);
    assert.equal((await listTavernManagerMessages(restoredA1))[0]?.content, 'manager says hi');
    assert.equal((await listTavernManagerRuns(restoredA1))[0]?.id, 'restore-job-test-run-a-1');
    const restoredCandidate = await getTavernManagerCandidate(restoredA1);
    assert.match(restoredCandidate?.id || '', /^restore-job-test-manager-candidate-/);
    assert.equal(restoredCandidate?.assistantOrder, 23);
    assert.equal((await tavernMemoryFilesTable.get([restoredA1, 'memory/state.md']))?.content, 'memory for a');
    assert.equal((await tavernStateDocumentsTable.get([restoredA1, 'tavern.map', 'map-main']))?.digest, 'map-digest');
    assert.equal((await tavernTasksTable.get([restoredA1, 'task-a-1']))?.sourceManagerRunId, 'restore-job-test-run-a-1');
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
    assert.equal((await tavernManagerTaskSnapshotsTable.get('restore-job-test-run-a-1'))?.sessionId, restoredA1);
    assert.equal((await tavernTaskSnapshotsTable.get([restoredA1, 2]))?.tasks[0]?.sessionId, restoredA1);
    assert.deepEqual((await tavernTaskFingerprintStatesTable.get(restoredA1))?.abandonedFingerprints, ['fp-abandoned']);
    assert.equal(await getSelectedTavernSessionId(), restoredA2);
    assert.equal(result.selectedSessionId, restoredA2);
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
    await seedArchiveSource();
    const { manifest, records } = await buildArchive('char-a', 500);
    await db.delete();
    await db.open();
    await createTavernSession({ id: 'old-a', title: 'old', characterKey: 'char-a', characterName: 'Aster' });
    await appendTavernMessage('old-a', { role: 'user', content: 'old local message' });
    await createTavernSession({ id: 'keep-b', title: 'keep', characterKey: 'char-b', characterName: 'Beryl' });

    await assert.rejects(
        restoreTavernCharacterArchiveFromRecords({
            manifest,
            characterKey: 'char-a',
            jobId: 'bad-job',
            recordBatches: (async function* batches() {
                yield records.slice(0, 3);
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
});

test('tavern character archive can restore an empty archive by clearing only the current character', async () => {
    await db.delete();
    await db.open();
    await createTavernSession({ id: 'old-a', title: 'old', characterKey: 'char-a', characterName: 'Aster' });
    await appendTavernMessage('old-a', { role: 'user', content: 'old local message' });
    await createTavernSession({ id: 'keep-b', title: 'keep', characterKey: 'char-b', characterName: 'Beryl' });
    await appendTavernMessage('keep-b', { role: 'user', content: 'keep me' });
    const manifest: TavernCharacterArchiveManifest = {
        version: 1,
        archiveId: 'empty-archive',
        complete: true,
        exportedAt: 123,
        character: { characterKey: 'char-a', name: 'Aster' },
        counts: {
            sessions: 0,
            messages: 0,
            memoryFiles: 0,
            stateDocuments: 0,
            tasks: 0,
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
