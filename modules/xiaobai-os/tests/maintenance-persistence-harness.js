import { createChatReferencePort } from '../storage/chat-reference.js';
import { createChatBindingManager } from '../storage/chat-binding.js';
import { createChatBindingLifecycle } from '../storage/chat-binding-lifecycle.js';
import { createSidecarIndex } from '../storage/sidecar-index.js';
import { createUserStoryResolver } from '../host/user-story.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';
import { createMapService } from '../apps/map/application/service.js';
import { MAP_PARTITION } from '../apps/map/partition.js';
import { createWorldService } from '../apps/world/application/service.js';
import { WORLD_PARTITION } from '../apps/world/partition.js';
import { createTasksService } from '../apps/tasks/application/service.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { userEconomyHarness } from './user-economy-harness.js';

// Only persistence is replaced: references, binding lifecycle and both file
// transaction owners are the production implementations.
export async function maintenancePersistenceHarness() {
    const state = {
        current: { identityKey: 'chat-a', binding: { kind: 'character', ownerLocator: 'a.png', chatId: 'a' }, metadata: {} },
        headers: new Map(), sidecars: new Map(), writes: [], chatSaves: [], headerReads: 0,
        fileMode: 'confirmed', chatMode: 'confirmed',
        messages: Array.from({ length: 60 }, (_, index) => ({ mes: `floor-${index}`, is_user: index % 2 === 0, name: 'test', swipe_id: 0 })),
    };
    const metadata = {
        capture: () => state.current,
        async read(binding) { state.headerReads++; return structuredClone(state.headers.get(binding.chatId) ?? null); },
        async save(capture) {
            state.chatSaves.push(structuredClone(capture));
            if (state.chatMode === 'rejected') { throw Object.assign(new Error('rejected'), { uncertain: false }); }
            if (state.chatMode === 'unknown') { throw new Error('connection lost'); }
            state.headers.set(capture.binding.chatId, structuredClone(capture.metadata));
        },
    };
    const references = createChatReferencePort(metadata);
    const storage = {
        read: async id => structuredClone(state.sidecars.get(id) ?? null),
        async replace(input) {
            state.writes.push(structuredClone(input));
            if (state.fileMode === 'failed') { return { status: 'failed', error: { code: 'storage_write_failed', message: 'rejected', retryable: true } }; }
            if (state.fileMode !== 'unknown') { state.sidecars.set(input.candidate.osId, structuredClone(input.candidate)); }
            return state.fileMode === 'confirmed' ? { status: 'confirmed' }
                : { status: 'unconfirmed', observed: structuredClone(state.sidecars.get(input.candidate.osId) ?? null) };
        },
        delete: async id => state.sidecars.delete(id) ? 'deleted' : 'missing',
    };
    const partitions = new XiaobaiOsPartitionRegistry();
    partitions.register(MAP_PARTITION); partitions.register(WORLD_PARTITION);
    let serial = 0;
    let lifecycle;
    const coordinator = createTransactionCoordinator({ storage, partitions, chatReferences: references,
        createId: () => `sidecar-${++serial}`, beforeRead: () => lifecycle.ready() });
    const indexFiles = new Map();
    const manager = createChatBindingManager({ metadata, references, storage, createId: () => `binding-${++serial}`,
        index: createSidecarIndex({ read: async name => indexFiles.get(name) ?? null,
            replace: async (name, value) => { indexFiles.set(name, structuredClone(value)); } }) });
    lifecycle = createChatBindingLifecycle({ manager, installResolvedSidecar: coordinator.installResolvedEnvelope,
        invalidateSidecar: coordinator.invalidateCurrent,
        events: { on() {}, removeListener() {} }, eventNames: { chatChanged: 'changed', chatRenamed: 'renamed', chatDeleted: 'deleted',
            groupChatDeleted: 'group-deleted', characterRenamed: 'character-renamed' } });
    lifecycle.start();
    await lifecycle.ready();
    const resolveStory = createUserStoryResolver({ ready: lifecycle.ready, references, manager, install: coordinator.installResolvedEnvelope });
    const user = await userEconomyHarness({ references, resolveStory });
    const tasks = createTasksService(user.store(TASKS_PARTITION), user.transactions, user.economy, { getEvidenceDigest: () => 'baseline' });
    const map = createMapService(coordinator.createScopedStore(MAP_PARTITION), coordinator);
    const world = createWorldService(coordinator.createScopedStore(WORLD_PARTITION), coordinator, () => state.current.identityKey);
    return {
        state, references, coordinator, manager, lifecycle, resolveStory, metadata, storage, user, tasks, map, world, economy: user.economy,
        capture: () => ({ identityKey: state.current.identityKey, messages: state.messages, playerName: '玩家', assistantName: '旁白' }),
        filesFor: id => id === 'tasks' ? user.transactions : coordinator,
        writesFor: id => id === 'tasks' ? user.state.writes : state.writes,
        setFileMode(id, mode) { if (id === 'tasks') { user.state.mode = mode; } else { state.fileMode = mode; } },
        hostSave() { state.headers.set(state.current.binding.chatId, structuredClone(state.current.metadata)); },
        async reload() {
            state.current = { ...state.current, metadata: structuredClone(state.headers.get(state.current.binding.chatId) ?? {}) };
            coordinator.invalidateCurrent();
            await lifecycle.refresh();
        },
        async dispose() { tasks.dispose(); map.dispose(); world.dispose(); await lifecycle.stop(); },
    };
}

export async function acceptFixtureTask(h) {
    const board = await h.tasks.replaceBoard({ expectedBoardId: null, generatedAt: 10, listings: [{ grade: 'B', tags: ['禁忌'], posture: '中介入',
        title: '送信', hook: '把信送给守卫', objective: '守卫收到信', requirements: '', location: '钟楼', timing: '任意时候', risk: '盘查', reward: 150 }] }, () => true);
    return (await h.tasks.acceptListing({ actionId: 'accept', boardId: board.view.domain.board.boardId,
        listingId: board.view.domain.board.listings[0].listingId }, () => true)).record;
}
