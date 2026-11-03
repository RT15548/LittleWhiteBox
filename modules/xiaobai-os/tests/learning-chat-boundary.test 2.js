import assert from 'node:assert/strict';
import test from 'node:test';
import { createLearningTeacherService } from '../apps/learning/application/teacher.js';
import { selectedLearningCompanion } from '../apps/learning/domain/conversation.js';
import { LEARNING_PARTITION } from '../apps/learning/partition.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { createEconomyCapabilityRegistrations, ECONOMY_PARTITION, ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY } from '../capabilities/economy/index.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';
import { createChatBindingManager } from '../storage/chat-binding.js';
import { createChatReferencePort } from '../storage/chat-reference.js';
import { createSidecarIndex } from '../storage/sidecar-index.js';

async function harness() {
    const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId: 'original' };
    const state = { capture: { identityKey: 'runtime-original', binding, metadata: {} }, files: new Map(), headers: new Map(), writes: 0 };
    const headerKey = value => `${value.ownerLocator}:${value.chatId}`;
    const metadata = {
        capture: () => structuredClone(state.capture),
        async save(capture) { state.capture.metadata = capture.metadata; state.headers.set(headerKey(capture.binding), structuredClone(capture.metadata)); },
        async read(value) { return structuredClone(state.headers.get(headerKey(value)) ?? null); },
    };
    const references = createChatReferencePort(metadata);
    const storage = {
        async read(osId) { return structuredClone(state.files.get(osId) ?? null); },
        async replace({ candidate }) { state.files.set(candidate.osId, structuredClone(candidate)); state.writes++; return { status: 'confirmed' }; },
        async delete(osId) { return state.files.delete(osId) ? 'deleted' : 'missing'; },
    };
    let indexData = null;
    const index = createSidecarIndex({ read: async () => indexData, async replace(_name, value) { indexData = value; } });
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const partitions = new XiaobaiOsPartitionRegistry();
    partitions.register(LEARNING_PARTITION);
    partitions.register(ECONOMY_PARTITION);
    let id = 0;
    const createId = () => `probe-${++id}`;
    const coordinator = createTransactionCoordinator({ storage, partitions, chatReferences: references, capabilityBinder: capabilities, createId });
    await capabilities.install({ createStore: (registration, allowedCapabilities) => coordinator.createScopedStore(registration, { allowedCapabilities }), files: coordinator });
    const store = coordinator.createScopedStore(LEARNING_PARTITION, { allowedCapabilities: [ECONOMY_TRANSACTION_CAPABILITY] });
    const manager = createChatBindingManager({ storage, metadata, references, index, createId });
    const teacher = createLearningTeacherService(store, {
        playerName: () => 'ＡＬＩＣＥ',
        knownPeople: () => [
            { name: '玩家', aliases: ['Alice'], text: '玩家档案' },
            { name: '小林', aliases: ['林老师'], text: '人物详细资料' },
        ],
    });
    return { state, store, teacher, manager, coordinator, capabilities, index, headerKey };
}

test('teacher suggestions exclude the player; choosing a teacher only stores a preference', async () => {
    const { state, teacher, store } = await harness();
    assert.deepEqual(teacher.candidates(), [{ name: '小林', aliases: ['林老师'], text: '' }]);
    const before = await teacher.read();
    assert.ok(before.osId);
    assert.equal(state.writes, 1);
    assert.equal((await teacher.select(before.identityKey, { name: '小林', note: '' }, () => true)).status, 'confirmed');
    const current = await store.read();
    assert.ok(current.osId);
    assert.deepEqual(selectedLearningCompanion(state.files.get(current.osId).partitions.learning).person, { name: '小林', note: '' });
    await assert.rejects(teacher.select(before.identityKey, null, () => false), /learning_context_changed/);
    assert.equal(selectedLearningCompanion((await store.read()).value).person.name, '小林');
    assert.equal(LEARNING_PARTITION.parse({ teacher: null, profiles: [] }).ok, false);
});

test('rename keeps teacher and osId; full copy and historical branch get independent identities', async () => {
    const { state, teacher, manager, coordinator, store, index, headerKey } = await harness();
    await teacher.read();
    await teacher.select(state.capture.identityKey, { name: '小林', note: '练口语' }, () => true);
    const original = await store.read();
    const originalMetadata = structuredClone(state.capture.metadata);
    await index.remember(original.osId, state.capture.binding);
    const originalBinding = structuredClone(state.capture.binding);
    state.headers.delete(headerKey(originalBinding));
    state.capture = { ...state.capture, identityKey: 'runtime-renamed', binding: { ...originalBinding, chatId: 'renamed' } };
    const renamed = await manager.resolveCurrent();
    assert.equal(renamed.envelope.osId, original.osId);
    assert.equal(selectedLearningCompanion(renamed.envelope.partitions.learning).person.name, '小林');
    state.headers.set(headerKey(state.capture.binding), originalMetadata);
    state.capture = { ...state.capture, identityKey: 'runtime-copy', binding: { ...originalBinding, chatId: 'copy' }, metadata: originalMetadata };
    const copy = await manager.resolveCurrent();
    assert.notEqual(copy.envelope.osId, original.osId);
    assert.deepEqual(copy.envelope.partitions.learning, renamed.envelope.partitions.learning);
    state.capture = { ...state.capture, identityKey: 'runtime-branch', binding: { ...originalBinding, chatId: 'branch' }, metadata: {}, mainChatId: 'renamed' };
    const branch = await manager.resolveCurrent();
    assert.notEqual(branch.envelope.osId, original.osId);
    assert.notEqual(branch.envelope.osId, copy.envelope.osId);
    await coordinator.installResolvedEnvelope(branch.envelope);
    assert.equal(selectedLearningCompanion((await store.read()).value).person.name, '小林');
    await index.remember(copy.envelope.osId, copy.envelope.binding);
    assert.equal(await manager.handleChatDeleted('copy', 'avatar.png'), 'deleted');
    assert.equal(state.files.has(original.osId), true);
    assert.equal(state.files.has(branch.envelope.osId), true);
});

test('Learning-owned transactions can reward through Economy without modifying teacher data or issuing twice', async () => {
    const { store, teacher, capabilities } = await harness();
    await teacher.read();
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    await economy.ensureOpen();
    const before = (await store.read()).value;
    // Frozen test intent validates the existing ledger seam, not teaching completion or final pricing.
    const leg = { actionId: 'learning:unit:test', idempotencyKey: 'learning:unit:test',
        fromAccountId: 'counterparty:learning:rewards', toAccountId: 'player', amount: 17,
        kind: 'learning_reward', title: '学习奖励', sourceId: 'test' };
    const post = () => store.transact(transaction => transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY).postAction({ legs: [leg] }));
    assert.equal((await post()).result.created, true);
    assert.equal((await post()).result.created, false);
    await economy.refresh();
    assert.equal(economy.getPlayerBalance(), 117);
    assert.equal(economy.listTransactions().transactions.filter(item => item.sourceDomain === 'learning').length, 1);
    assert.deepEqual((await store.read()).value, before);
});
