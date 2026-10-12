import { createAdministratorRepository } from '../apps/administrator/storage/repository.js';
import { createAdministratorConversation } from '../apps/administrator/application/conversation.js';
import { createAdministratorRuntime } from '../apps/administrator/application/runtime.js';
import { createAdministratorController } from '../apps/administrator/host/controller.js';
import { ADMINISTRATOR_PARTITION } from '../apps/administrator/partition.js';
import { createTasksService } from '../apps/tasks/application/service.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { createTasksManagement } from '../apps/tasks/management/participant.js';
import { createMapService } from '../apps/map/application/service.js';
import { MAP_PARTITION } from '../apps/map/partition.js';
import { createMapManagement } from '../apps/map/management/participant.js';
import { createWorldService } from '../apps/world/application/service.js';
import { WORLD_PARTITION } from '../apps/world/partition.js';
import { createWorldManagement } from '../apps/world/management/participant.js';
import { createEconomyCapabilityRegistrations, ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY } from '../capabilities/economy/index.js';
import { ensureEconomy } from '../domains/economy/ledger.js';
import { createManagementRegistry } from '../capabilities/management/index.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';
import { xiaobaiOsApps } from '../shell/app-catalog.js';
import { TOOLS_LOAD } from '../apps/administrator/agent/tool-loader.js';

export const COMMON_TOOL_NAMES = [TOOLS_LOAD, 'ChatSearch', 'ChatRead', 'OSInspect', 'ToolResultRead'];

// Scripted providers acquire APP packages only when the test needs their record tools.
export const withLoadedTools = (apps, generate) => request => apps.length && request.tools.every(tool => COMMON_TOOL_NAMES.includes(tool.function.name))
    ? { toolCalls: [{ id: 'load-tools', name: TOOLS_LOAD, arguments: JSON.stringify({ apps }) }] } : generate(request);

export const tick = () => new Promise(resolve => setTimeout(resolve, 0));
export async function settled(runtime) { for (let index = 0; runtime.busy() && index < 200; index++) { await tick(); } if (runtime.busy()) { throw new Error('fixture_run_not_settled'); } }
export async function administratorHarness(initial = {}, { fresh = false } = {}) {
    let id = 0;
    const binding = { kind: 'character', ownerLocator: 'admin-test.png', chatId: 'isolated' };
    const state = {
        capture: { identityKey: 'admin-test', binding, reference: { formatVersion: 1, osId: 'admin-os' } },
        persisted: { formatVersion: 1, osId: 'admin-os', binding, revision: 0, commitId: 'initial', partitions: {
            economy: ensureEconomy(undefined, { now: () => 1, createId: () => 'opening' }), ...structuredClone(initial),
        } }, writes: [], replace: null, removed: [], imageFailure: false, requests: [],
        messages: Array.from({ length: 60 }, (_, floor) => ({ mes: `floor-${floor}`, is_user: floor % 2 === 0, name: 'test', swipe_id: 0 })),
        generate: async () => ({ text: '已核实。' }),
        environment: { observedAt: 1, apps: xiaobaiOsApps.map(({ id, name, description }) => ({ id, name, description, load: { state: 'ready' } })),
            maintenance: [], mainChatGenerating: false, storage: { chat: { state: 'ready', hasPendingCommit: false }, user: { state: 'ready', hasPendingCommit: false } } },
        environmentReads: [], inspect: null,
    };
    if (fresh) { state.capture.reference = null; state.persisted = null; }
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const partitions = new XiaobaiOsPartitionRegistry();
    for (const registration of [...capabilities.partitions(), ADMINISTRATOR_PARTITION, TASKS_PARTITION, MAP_PARTITION, WORLD_PARTITION]) { partitions.register(registration); }
    const coordinator = createTransactionCoordinator({ partitions, capabilityBinder: capabilities, createId: () => `test-${++id}`,
        storage: { async read() { return structuredClone(state.persisted); }, async replace(input) { state.writes.push(structuredClone(input)); if (state.replace) { return state.replace(input); } state.persisted = structuredClone(input.candidate); return { status: 'confirmed' }; }, async delete() { return 'deleted'; } },
        chatReferences: { capture: () => structuredClone(state.capture), isCurrent: captured => captured.identityKey === state.capture.identityKey,
            async install(_, reference) { state.capture.reference = reference; return { status: 'confirmed' }; } },
    });
    await capabilities.install({ createStore: (registration, allowedCapabilities) => coordinator.createScopedStore(registration, { allowedCapabilities }), files: coordinator });
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    const tasks = createTasksService(coordinator.createScopedStore(TASKS_PARTITION, { allowedCapabilities: [ECONOMY_TRANSACTION_CAPABILITY] }), coordinator, economy);
    const map = createMapService(coordinator.createScopedStore(MAP_PARTITION), coordinator);
    const world = createWorldService(coordinator.createScopedStore(WORLD_PARTITION), coordinator, () => state.capture.identityKey);
    const registry = createManagementRegistry();
    registry.register(createTasksManagement(tasks, () => 30)); registry.register(createMapManagement(map, () => ({ actorKey: 'player', displayName: '玩家' })));
    registry.register(createWorldManagement(world));
    const repository = createAdministratorRepository(coordinator.createScopedStore(ADMINISTRATOR_PARTITION), coordinator);
    const images = { async load() { if (state.imageFailure) { throw new Error('administrator_image_missing'); } return 'data:image/png;base64,YQ=='; },
        async save(osId, input) { return { name: input.name, path: `/user/images/xb-os-admin-${osId}/test.png` }; },
        async remove(osId, image) { state.removed.push({ osId, image }); }, async clear(osId) { state.removed.push({ osId, all: true }); } };
    const conversation = createAdministratorConversation(repository, images);
    await conversation.refresh();
    const capture = () => ({ identityKey: state.capture.identityKey, messages: state.messages, playerName: '玩家', assistantName: '旁白' });
    const gateway = { async loadConfig() { return {}; }, async openSession() { return { providerConfig: {}, supportsSessionToolLoop: false,
        async run(request) { state.requests.push(request); return state.generate(request); } }; } };
    const pushed = []; let controller;
    const readEnvironment = identity => { state.environmentReads.push(identity); return state.inspect ? state.inspect(identity) : structuredClone(state.environment); };
    const runtime = createAdministratorRuntime({ conversation, repository, images, gateway, management: registry, capture, readEnvironment, changed: () => controller?.emit() });
    controller = createAdministratorController(conversation, runtime);
    await controller.activate({ isCurrent: () => true, activationToken: 'test', post: (type, payload) => { pushed.push({ type, payload }); return true; } });
    return { state, coordinator, tasks, map, world, economy, registry, repository, images, conversation, runtime, controller, gateway, capture, readEnvironment, pushed,
        async request(type, payload = {}) { return controller.handleMessage({ type: `administrator/${type}`, payload: { chatIdentity: state.capture.identityKey,
            ...(type === 'send' ? { submissionId: `submission-${++id}` } : {}), ...payload } }); } };
}
