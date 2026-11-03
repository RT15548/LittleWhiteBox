import assert from 'node:assert/strict';
import test from 'node:test';

import { createAgentApiModule } from '../apps/agent-api/module.js';
import { createFourthWallModule } from '../apps/fourth-wall/module.js';
import {
    createMapContextCapabilityRegistration,
    MAP_CONTEXT_CAPABILITY,
} from '../apps/map/context-capability.js';
import { createMapModule, MAP_PARTITION } from '../apps/map/module.js';
import { createWalletModule } from '../apps/wallet/module.js';
import { AGENT_CAPABILITY } from '../capabilities/agent/index.js';
import { createEconomyCapabilityRegistrations } from '../capabilities/economy/index.js';
import { MAINTENANCE_CAPABILITY } from '../capabilities/maintenance/index.js';
import { createManagementCapabilityRegistration, MANAGEMENT_CAPABILITY } from '../capabilities/management/index.js';
import { createKernelComposition } from '../host/kernel-composition.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { headlessPromptInjection } from './helpers/prompt-injection.js';

function ports() {
    const capture = {
        identityKey: 'character:avatar.png:chat-a',
        binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' },
        reference: null,
    };
    return {
        storage: {
            read: async () => null,
            replace: async () => assert.fail('module installation must not write sidecar data'),
            delete: async () => 'missing',
        },
        chatReferences: {
            capture: () => structuredClone(capture),
            isCurrent: captured => captured.identityKey === capture.identityKey,
            install: async () => assert.fail('module installation must not create a chat reference'),
        },
    };
}

test('Map prompt context failure is optional and does not escape to a consumer', async () => {
    const capabilities = createCapabilityRegistry([createMapContextCapabilityRegistration()]);
    await capabilities.install();
    const mapContext = capabilities.require(MAP_CONTEXT_CAPABILITY);
    const originalError = console.error;
    console.error = () => undefined;
    try {
        mapContext.registerProvider(() => { throw new Error('broken Map partition'); });
        assert.equal(mapContext.readPromptContext(), '');
    } finally {
        console.error = originalError;
        await capabilities.dispose();
    }
});

test('the non-production composition installs D1 modules through declared capabilities only', async () => {
    const order = [];
    const posts = [];
    const agent = {
        async loadConfig() { throw new Error('Agent is not configured'); },
        saveConfig: async patch => patch,
        openSession: async () => assert.fail('opening an APP must not connect to a provider'),
        run: async () => assert.fail('opening an APP must not run a provider'),
        pullModels: async () => assert.fail('opening an APP must not pull models'),
        testConnection: async () => assert.fail('opening an APP must not test a provider'),
    };
    let fourthWallRepository;
    const mapModule = createMapModule({
        async install(context) {
            assert.equal(context.map.readCurrent().map, null);
            assert.equal(context.agent, agent);
            assert.equal(context.maintenance.agent, agent);
            return {};
        },
        async dispose() { order.push('map-app'); },
    });
    const fourthWallModule = createFourthWallModule({
        async install(context) {
            fourthWallRepository = context.repository;
            assert.equal(context.agent, agent);
            return {};
        },
        async dispose() { order.push('fourth-wall-app'); },
    });
    const agentApiModule = createAgentApiModule();
    const walletModule = createWalletModule({
        getChatIdentity: () => ({ key: 'character:avatar.png:chat-a' }),
        createRuntime(economy) {
            assert.equal(economy.postAction, undefined);
            return {};
        },
    });
    const composition = createKernelComposition({
        ...ports(),
        user: { storage: { read: async () => null, replace: async () => {} }, initialPartitions: async () => ({}),
            resolveStory: async () => ports().chatReferences.capture() },
        capabilities: [
            headlessPromptInjection(),
            ...createEconomyCapabilityRegistrations(),
            createMapContextCapabilityRegistration(),
            createManagementCapabilityRegistration(),
            {
                token: AGENT_CAPABILITY,
                ownerId: 'agent',
                dependencies: [],
                install: () => agent,
                dispose: () => { order.push('agent-capability'); },
            },
            {
                token: MAINTENANCE_CAPABILITY,
                ownerId: 'maintenance',
                dependencies: [AGENT_CAPABILITY],
                install: context => ({ agent: context.require(AGENT_CAPABILITY) }),
            },
        ],
        modules: [mapModule, fourthWallModule, agentApiModule, walletModule],
    });

    await composition.install();
    assert.deepEqual(composition.apps.status('map'), { state: 'ready' });
    assert.deepEqual(composition.apps.status('fourth-wall'), { state: 'ready' });
    assert.deepEqual(composition.apps.status('agent-api'), { state: 'ready' });
    assert.deepEqual(composition.apps.status('wallet'), { state: 'ready' });
    assert.equal(mapModule.partition, MAP_PARTITION);
    assert.deepEqual(mapModule.capabilities.map(token => token.id), [
        'agent.shared',
        'maintenance.runner',
        MANAGEMENT_CAPABILITY.id,
        MAP_CONTEXT_CAPABILITY.id,
        'prompt.injection',
    ]);
    assert.deepEqual(fourthWallModule.capabilities.map(token => token.id), ['agent.shared']);
    assert.equal(agentApiModule.partition, undefined);
    assert.deepEqual(agentApiModule.capabilities.map(token => token.id), ['agent.shared']);
    assert.equal(walletModule.partition, undefined);
    assert.deepEqual(walletModule.capabilities.map(token => token.id), ['economy.read']);

    const empty = await fourthWallRepository.prepareCurrentChatFourthWall();
    assert.equal(empty.activeSessionId, 'default');
    const runtime = composition.apps.runtime('agent-api');
    runtime.activate({ post: (type, payload) => posts.push({ type, payload }) });
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(posts.at(-1).payload.state.status, 'error');
    assert.deepEqual(composition.apps.status('agent-api'), { state: 'ready' });

    const removed = [];
    await fourthWallModule.clearData({ removePartition: async key => { removed.push(key); } });
    assert.deepEqual(removed, ['fourthWall']);

    await composition.dispose();
    assert.equal(order.at(-1), 'agent-capability');
});

test('a missing Agent capability fails only the D1 modules that declare it', async () => {
    const independent = {
        descriptor: { id: 'independent', name: 'Independent', accent: '#000' },
        capabilities: [],
        async install() { return {}; },
    };
    const composition = createKernelComposition({
        ...ports(),
        capabilities: [],
        modules: [
            createAgentApiModule(),
            createFourthWallModule({ async install() { return {}; } }),
            createWalletModule({
                getChatIdentity: () => ({ key: 'character:avatar.png:chat-a' }),
                createRuntime: () => ({}),
            }),
            independent,
        ],
    });

    await composition.install();
    assert.equal(composition.apps.status('agent-api').failure.phase, 'dependency');
    assert.equal(composition.apps.status('fourth-wall').failure.phase, 'dependency');
    assert.equal(composition.apps.status('wallet').failure.phase, 'dependency');
    assert.deepEqual(composition.apps.status('independent'), { state: 'ready' });
});
