import assert from 'node:assert/strict';
import test from 'node:test';

import { createAppModuleRegistry } from '../kernel/app-registry.js';
import { createCapabilityRegistry, createCapabilityToken } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';

const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' };

function valuePartition(key, ownerId) {
    return {
        key,
        ownerId,
        schemaVersion: 1,
        parse(value) {
            return value?.schemaVersion === 1 && Number.isSafeInteger(value.value)
                ? { ok: true, value }
                : { ok: false, error: { code: 'partition_invalid', message: `${key} is invalid` } };
        },
        serialize: value => value,
        createInitial: () => ({ schemaVersion: 1, value: 0 }),
    };
}

function createKernelHarness() {
    const appPartition = valuePartition('testApp', 'testApp');
    const sharedPartition = valuePartition('shared', 'shared');
    const updateShared = createCapabilityToken('shared.update');
    const hiddenUpdate = createCapabilityToken('shared.hidden');
    const capabilities = createCapabilityRegistry([
        {
            token: updateShared,
            ownerId: 'shared',
            dependencies: [],
            partition: sharedPartition,
            bindTransaction({ requesterId, access }) {
                return {
                    increment() {
                        const current = access.readPartition(sharedPartition);
                        access.replacePartition(sharedPartition, { ...current, value: current.value + 1 });
                        return requesterId;
                    },
                };
            },
        },
        {
            token: hiddenUpdate,
            ownerId: 'shared',
            dependencies: [],
            bindTransaction: ({ access }) => ({ access }),
        },
    ]);
    const partitions = new XiaobaiOsPartitionRegistry();
    for (const registration of capabilities.partitions()) { partitions.register(registration); }
    partitions.register(appPartition);
    const state = {
        writes: 0,
        persisted: {
            formatVersion: 1,
            osId: 'os_1',
            binding,
            revision: 0,
            commitId: 'commit_0',
            partitions: {
                testApp: { schemaVersion: 1, value: 1 },
                shared: { schemaVersion: 1, value: 10 },
            },
        },
    };
    const coordinator = createTransactionCoordinator({
        storage: {
            read: async () => structuredClone(state.persisted),
            replace: async ({ candidate }) => {
                state.writes += 1;
                state.persisted = structuredClone(candidate);
                return { status: 'confirmed' };
            },
            delete: async () => 'deleted',
        },
        partitions,
        capabilityBinder: capabilities,
        chatReferences: {
            capture: () => ({
                identityKey: 'character:avatar.png:chat-a',
                binding,
                reference: { formatVersion: 1, osId: 'os_1' },
            }),
            isCurrent: () => true,
            install: async () => ({ status: 'confirmed' }),
        },
        createId: () => `commit_${state.persisted.revision + 1}`,
    });
    let appStore;
    const apps = createAppModuleRegistry([{
        descriptor: { id: 'testApp', name: 'Test', accent: '#000' },
        partition: appPartition,
        capabilities: [updateShared],
        async install(context) {
            appStore = context.partition;
            return {};
        },
    }], {
        createStore: (registration, allowedCapabilities) =>
            coordinator.createScopedStore(registration, { allowedCapabilities }),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: coordinator,
    });
    return { apps, capabilities, state, updateShared, hiddenUpdate, getStore: () => appStore };
}

test('APP capability manifest authorizes one cross-partition candidate and one upload', async () => {
    const harness = createKernelHarness();
    await harness.capabilities.install();
    await harness.apps.installAll();
    const result = await harness.getStore().transact(transaction => {
        const caller = transaction.useCapability(harness.updateShared).increment();
        transaction.replace({ ...transaction.current, value: transaction.current.value + 1 });
        return caller;
    });

    assert.equal(result.status, 'confirmed');
    assert.equal(result.result, 'testApp');
    assert.equal(harness.state.writes, 1);
    assert.equal(harness.state.persisted.partitions.testApp.value, 2);
    assert.equal(harness.state.persisted.partitions.shared.value, 11);

    await assert.rejects(
        harness.getStore().transact(transaction => transaction.useCapability(harness.hiddenUpdate)),
        error => error.code === 'capability_not_authorized',
    );
    assert.equal(harness.state.writes, 1);
});

test('background rejection fails only its owning APP module', async () => {
    const capabilities = createCapabilityRegistry([]);
    await capabilities.install();
    const apps = createAppModuleRegistry([
        {
            descriptor: { id: 'broken', name: 'Broken', accent: '#000' },
            capabilities: [],
            async install({ execution }) {
                void execution.run(async () => { throw new Error('background exploded'); });
                return {};
            },
        },
        {
            descriptor: { id: 'healthy', name: 'Healthy', accent: '#fff' },
            capabilities: [],
            async install() { return {}; },
        },
    ], {
        createStore: () => assert.fail('partition store is not expected'),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: {
            retryPending: async () => ({ status: 'none' }),
            adoptServerState: async () => ({ status: 'none' }),
            getFileState: () => 'ready',
            hasPendingCommit: () => false,
            subscribeFileState: () => () => undefined,
        },
    });

    await apps.installAll();
    assert.equal(apps.status('broken').state, 'failed');
    assert.equal(apps.status('broken').failure.phase, 'background');
    assert.equal(apps.runtime('broken'), null);
    assert.deepEqual(apps.status('healthy'), { state: 'ready' });
    assert.notEqual(apps.runtime('healthy'), null);
});

test('dependency, install, and transient activation failures remain local to their APP modules', async () => {
    const missingCapability = createCapabilityToken('missing.capability');
    const capabilities = createCapabilityRegistry([]);
    await capabilities.install();
    let activationShouldFail = true;
    const apps = createAppModuleRegistry([
        {
            descriptor: { id: 'missing', name: 'Missing', accent: '#111' },
            capabilities: [missingCapability],
            async install() { return {}; },
        },
        {
            descriptor: { id: 'broken-install', name: 'Broken install', accent: '#222' },
            capabilities: [],
            async install() { throw new Error('install exploded'); },
        },
        {
            descriptor: { id: 'activation', name: 'Activation', accent: '#333' },
            capabilities: [],
            async install() {
                return {
                    async activate() {
                        if (activationShouldFail) { throw new Error('activation exploded'); }
                        return { ready: true };
                    },
                };
            },
        },
        {
            descriptor: { id: 'healthy', name: 'Healthy', accent: '#fff' },
            capabilities: [],
            async install() { return {}; },
        },
    ], {
        createStore: () => assert.fail('partition store is not expected'),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: {
            retryPending: async () => ({ status: 'none' }),
            adoptServerState: async () => ({ status: 'none' }),
            getFileState: () => 'ready',
            hasPendingCommit: () => false,
            subscribeFileState: () => () => undefined,
        },
    });

    await apps.installAll();
    assert.equal(apps.status('missing').failure.phase, 'dependency');
    assert.equal(apps.status('broken-install').failure.phase, 'install');
    assert.deepEqual(apps.status('healthy'), { state: 'ready' });
    await assert.rejects(apps.activate('activation', {
        activationToken: 'token-a',
        isCurrent: () => true,
        post: () => true,
    }), /activation exploded/);
    assert.deepEqual(apps.status('activation'), { state: 'ready' });
    assert.notEqual(apps.runtime('activation'), null);
    assert.deepEqual(apps.status('healthy'), { state: 'ready' });

    await assert.rejects(
        apps.retry('missing'),
        error => error.code === 'capability_unavailable' && error.retryable === false,
    );

    activationShouldFail = false;
    assert.deepEqual(await apps.activate('activation', {
        activationToken: 'token-b',
        isCurrent: () => true,
        post: () => true,
    }), { ready: true });
});

test('fatal activation failure releases the runtime before a retry installs its replacement', async () => {
    const capabilities = createCapabilityRegistry([]);
    await capabilities.install();
    let installs = 0;
    const disposed = [];
    const apps = createAppModuleRegistry([{
        descriptor: { id: 'activation', name: 'Activation', accent: '#333' },
        capabilities: [],
        async install() {
            const installation = ++installs;
            return {
                async activate() {
                    if (installation === 1) { throw new TypeError('activation exploded'); }
                    return installation;
                },
            };
        },
        async dispose() { disposed.push(installs); },
    }], {
        createStore: () => assert.fail('partition store is not expected'),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: {
            retryPending: async () => ({ status: 'none' }),
            adoptServerState: async () => ({ status: 'none' }),
            getFileState: () => 'ready',
            hasPendingCommit: () => false,
            subscribeFileState: () => () => undefined,
        },
    });

    await apps.installAll();
    await assert.rejects(apps.activate('activation', {
        activationToken: 'token-a',
        isCurrent: () => true,
        post: () => true,
    }), /activation exploded/);
    assert.deepEqual(disposed, [1]);
    await apps.retry('activation');
    assert.equal(await apps.activate('activation', {
        activationToken: 'token-b',
        isCurrent: () => true,
        post: () => true,
    }), 2);
});

test('registry disposal waits for installation and settles every APP cleanup', async () => {
    const capabilities = createCapabilityRegistry([]);
    await capabilities.install();
    let finishInstall;
    const disposed = [];
    const apps = createAppModuleRegistry([
        {
            descriptor: { id: 'slow', name: 'Slow', accent: '#111' },
            capabilities: [],
            async install() {
                await new Promise(resolve => { finishInstall = resolve; });
                return {};
            },
            async dispose() { disposed.push('slow'); throw new Error('slow dispose failed'); },
        },
        {
            descriptor: { id: 'healthy', name: 'Healthy', accent: '#fff' },
            capabilities: [],
            async install() { return {}; },
            async dispose() { disposed.push('healthy'); },
        },
    ], {
        createStore: () => assert.fail('partition store is not expected'),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: {
            retryPending: async () => ({ status: 'none' }),
            adoptServerState: async () => ({ status: 'none' }),
            getFileState: () => 'ready',
            hasPendingCommit: () => false,
            subscribeFileState: () => () => undefined,
        },
    });

    const installing = apps.installAll();
    while (typeof finishInstall !== 'function') { await new Promise(resolve => setTimeout(resolve, 0)); }
    const disposal = assert.rejects(apps.dispose(), /app module disposal failed/);
    finishInstall();
    await installing;
    await disposal;
    assert.deepEqual(disposed.sort(), ['healthy', 'slow']);
    await assert.rejects(apps.retry('healthy'), /app_registry_disposed/);
});

test('runtime failures stay local and only fatal failures take their APP offline', async () => {
    const capabilities = createCapabilityRegistry([]);
    await capabilities.install();
    const disposed = [];
    const modules = [
        {
            descriptor: { id: 'business', name: 'Business', accent: '#111' },
            capabilities: [],
            async install() {
                return { async handleMessage() { throw new Error('ordinary domain rejection'); } };
            },
            async dispose() { disposed.push('business'); },
        },
        {
            descriptor: { id: 'fatal', name: 'Fatal', accent: '#222' },
            capabilities: [],
            async install() {
                return {
                    async handleMessage() {
                        throw Object.assign(new Error('owned partition is invalid'), { code: 'partition_invalid' });
                    },
                };
            },
            async dispose() { disposed.push('fatal'); },
        },
        {
            descriptor: { id: 'healthy', name: 'Healthy', accent: '#fff' },
            capabilities: [],
            async install() { return {}; },
        },
    ];
    const apps = createAppModuleRegistry(modules, {
        createStore: () => assert.fail('partition store is not expected'),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: {
            retryPending: async () => ({ status: 'none' }),
            adoptServerState: async () => ({ status: 'none' }),
            getFileState: () => 'ready',
            hasPendingCommit: () => false,
            subscribeFileState: () => () => undefined,
        },
    });
    await apps.installAll();

    await assert.rejects(apps.handleMessage('business', { type: 'business/test' }), /ordinary domain rejection/);
    assert.deepEqual(apps.status('business'), { state: 'ready' });

    await assert.rejects(apps.handleMessage('fatal', { type: 'fatal/test' }), /owned partition is invalid/);
    assert.equal(apps.status('fatal').state, 'failed');
    assert.equal(apps.status('fatal').failure.phase, 'runtime');
    assert.equal(apps.runtime('fatal'), null);
    assert.deepEqual(apps.status('healthy'), { state: 'ready' });
    assert.deepEqual(disposed, ['fatal']);
});
