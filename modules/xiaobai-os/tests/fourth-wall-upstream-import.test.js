import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    convertUpstreamFourthWall,
    createFourthWallUpstreamImport,
} from '../apps/fourth-wall/upgrade/upstream-import.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';
import { createChatReferencePort } from '../storage/chat-reference.js';

async function loadFixture(name) {
    const text = await readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
    return JSON.parse(text);
}

function samplePartition() {
    return {
        key: 'sample',
        ownerId: 'sample',
        schemaVersion: 1,
        parse(value) {
            return value?.schemaVersion === 1 && typeof value.value === 'string'
                ? { ok: true, value }
                : { ok: false, error: { code: 'partition_invalid', message: 'sample invalid' } };
        },
        serialize: value => value,
        createInitial: () => ({ schemaVersion: 1, value: '' }),
    };
}

function createHarness(metadata, chatId) {
    const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId };
    const state = {
        metadata,
        persistedHeader: structuredClone(metadata),
        saveMode: 'confirmed',
        saveCalls: 0,
        writes: [],
        files: new Map(),
        deleted: [],
        generated: 0,
    };
    const metadataAdapter = {
        capture: () => ({
            identityKey: `character:avatar.png:${chatId}`,
            binding,
            metadata: state.metadata,
        }),
        async save() {
            state.saveCalls += 1;
            if (state.saveMode === 'explicit-failure') {
                throw Object.assign(new Error('metadata save failed'), {
                    code: 'SAVE_UNAVAILABLE',
                    uncertain: false,
                });
            }
            if (state.saveMode === 'unknown-confirmed') {
                state.persistedHeader = structuredClone(state.metadata);
                throw Object.assign(new Error('metadata result unknown'), {
                    code: 'SAVE_UNCONFIRMED',
                    uncertain: true,
                });
            }
            if (state.saveMode === 'unknown-unconfirmed') {
                throw Object.assign(new Error('metadata result unknown'), {
                    code: 'SAVE_UNCONFIRMED',
                    uncertain: true,
                });
            }
            state.persistedHeader = structuredClone(state.metadata);
        },
        read: async () => structuredClone(state.persistedHeader),
    };
    const importer = createFourthWallUpstreamImport(metadataAdapter, { now: () => 1720000000000 });
    const references = createChatReferencePort(metadataAdapter, {
        createInstallEffect: importer.createReferenceInstallEffect,
    });
    const registration = samplePartition();
    const partitions = new XiaobaiOsPartitionRegistry();
    partitions.register(registration);
    const coordinator = createTransactionCoordinator({
        storage: {
            read: async osId => structuredClone(state.files.get(osId) ?? null),
            async replace(input) {
                state.writes.push(structuredClone(input));
                state.files.set(input.candidate.osId, structuredClone(input.candidate));
                return { status: 'confirmed' };
            },
            async delete(osId) {
                state.deleted.push(osId);
                return state.files.delete(osId) ? 'deleted' : 'missing';
            },
        },
        partitions,
        chatReferences: references,
        prepareInitialPartitions: importer.prepareInitialPartitions,
        createId: () => `generated_${++state.generated}`,
    });
    return { coordinator, importer, references, state, store: coordinator.createScopedStore(registration) };
}

test('converts the upstream sessions fixture into the frozen Fourth Wall partition', async () => {
    const metadata = await loadFixture('upstream-fourth-wall-chat-sessions.json');
    const partition = convertUpstreamFourthWall(
        metadata['character-chat-a'].extensions.LittleWhiteBox.fw,
        1720000000000,
    );

    assert.equal(partition.schemaVersion, 2);
    assert.deepEqual(partition.state.settings, {
        maxChatLayers: 42,
        stream: false,
        disableAssistantPrefill: true,
    });
    assert.equal(partition.state.activeSessionId, 'sess_1710000003000');
    assert.deepEqual(partition.state.sessions[0].history[1], {
        role: 'ai',
        content: 'first assistant message [voice:calm]',
        thinking: 'private reasoning',
        ts: 1710000002000,
    });
    assert.deepEqual(partition.state.sessions[1].history[0], {
        role: 'ai',
        content: '(glanced at the last line) commentary',
        ts: 1710000004000,
        type: 'commentary',
    });
});

test('converts the earlier root history fixture only at the import boundary', async () => {
    const metadata = await loadFixture('upstream-fourth-wall-chat-history.json');
    const partition = convertUpstreamFourthWall(
        metadata['group-chat-b'].extensions.LittleWhiteBox.fw,
        1720000000000,
    );

    assert.equal(partition.state.sessions.length, 1);
    assert.equal(partition.state.sessions[0].id, 'default');
    assert.equal(partition.state.sessions[0].createdAt, 1720000000000);
    assert.equal(partition.state.sessions[0].history[1].thinking, 'legacy thought');
    assert.equal(partition.state.settings.disableAssistantPrefill, false);
    assert.equal(Object.hasOwn(partition.state, 'history'), false);
});

test('the first unrelated APP write imports Fourth Wall in one candidate and one metadata save', async () => {
    const metadata = await loadFixture('upstream-fourth-wall-chat-sessions.json');
    const harness = createHarness(metadata, 'character-chat-a');
    const result = await harness.store.transact(transaction => {
        transaction.replace({ schemaVersion: 1, value: 'written' });
        return 'written';
    });

    assert.equal(result.status, 'confirmed');
    assert.equal(harness.state.writes.length, 1);
    assert.deepEqual(Object.keys(harness.state.writes[0].candidate.partitions).sort(), ['fourthWall', 'sample']);
    assert.equal(harness.state.saveCalls, 1);
    assert.equal(metadata['character-chat-a'].extensions.LittleWhiteBox.fw, undefined);
    assert.deepEqual(metadata['character-chat-a'].extensions.LittleWhiteBox.keepSibling, { value: 1 });
    assert.deepEqual(metadata['character-chat-a'].extensions.OtherExtension, { keep: true });
    assert.equal(metadata['character-chat-a'].keepChatSibling, 'preserved');
    assert.equal(metadata.unrelatedMetadata, 'preserved');
    assert.equal(harness.references.capture().reference.osId, harness.state.writes[0].candidate.osId);
});

test('an explicit metadata failure restores upstream data and removes the orphan candidate', async () => {
    const metadata = await loadFixture('upstream-fourth-wall-chat-sessions.json');
    const before = structuredClone(metadata);
    const harness = createHarness(metadata, 'character-chat-a');
    harness.state.saveMode = 'explicit-failure';
    const result = await harness.store.transact(transaction => {
        transaction.replace({ schemaVersion: 1, value: 'written' });
    });

    assert.equal(result.status, 'failed');
    assert.equal(result.error.code, 'reference_install_failed');
    assert.deepEqual(metadata, before);
    assert.deepEqual(harness.state.deleted, [harness.state.writes[0].candidate.osId]);
    assert.equal(harness.state.files.size, 0);
});

test('an unknown metadata result confirms by header without creating another sidecar identity', async () => {
    const metadata = await loadFixture('upstream-fourth-wall-chat-sessions.json');
    const harness = createHarness(metadata, 'character-chat-a');
    harness.state.saveMode = 'unknown-confirmed';
    const result = await harness.store.transact(transaction => {
        transaction.replace({ schemaVersion: 1, value: 'written' });
    });

    assert.equal(result.status, 'confirmed');
    assert.equal(harness.state.writes.length, 1);
    assert.equal(harness.state.saveCalls, 1);
    assert.equal(harness.state.persistedHeader['character-chat-a'].extensions.LittleWhiteBox.fw, undefined);
});

test('retrying an unconfirmed metadata save reuses the same sidecar and converted partition', async () => {
    const metadata = await loadFixture('upstream-fourth-wall-chat-sessions.json');
    const harness = createHarness(metadata, 'character-chat-a');
    harness.state.saveMode = 'unknown-unconfirmed';
    const result = await harness.store.transact(transaction => {
        transaction.replace({ schemaVersion: 1, value: 'written' });
    });
    const candidate = structuredClone(harness.state.writes[0].candidate);

    assert.equal(result.status, 'unconfirmed');
    harness.state.saveMode = 'confirmed';
    assert.deepEqual(await harness.coordinator.retryPending(), { status: 'confirmed' });
    assert.equal(harness.state.writes.length, 1);
    assert.deepEqual(harness.state.writes[0].candidate, candidate);
    assert.equal(harness.state.saveCalls, 2);
    assert.equal(harness.references.capture().reference.osId, candidate.osId);
});

test('invalid upstream Fourth Wall data stays untouched and cannot block another APP first write', async () => {
    const chatId = 'character-chat-a';
    const metadata = {
        [chatId]: {
            extensions: {
                LittleWhiteBox: {
                    fw: { sessions: [] },
                },
            },
        },
    };
    const before = structuredClone(metadata);
    const harness = createHarness(metadata, chatId);

    const result = await harness.store.transact(transaction => {
        transaction.replace({ schemaVersion: 1, value: 'other APP still works' });
    });

    assert.equal(result.status, 'confirmed');
    assert.deepEqual(Object.keys(harness.state.writes[0].candidate.partitions), ['sample']);
    assert.deepEqual(metadata[chatId], before[chatId]);
    assert.ok(metadata.extensions.LittleWhiteBox.xiaobaiOsRef.osId);
    assert.throws(
        () => harness.importer.readCurrentPartition(),
        error => error.code === 'invalid_upstream_fourth_wall',
    );
});
