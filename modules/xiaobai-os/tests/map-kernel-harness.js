import { createMapService } from '../apps/map/application/service.js';
import { MAP_PARTITION } from '../apps/map/partition.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';

const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId: 'map-chat' };

export function createMapKernelHarness(initialMap = null) {
    let id = 0;
    const state = {
        capture: {
            identityKey: 'character:avatar.png:map-chat',
            binding,
            reference: initialMap ? { formatVersion: 1, osId: 'map_os' } : null,
        },
        persisted: initialMap ? {
            formatVersion: 1,
            osId: 'map_os',
            binding,
            revision: 0,
            commitId: 'map_commit_0',
            partitions: { map: structuredClone(initialMap) },
        } : null,
        reads: 0,
        writes: [],
        replaceImpl: null,
    };
    const storage = {
        async read() {
            state.reads += 1;
            return structuredClone(state.persisted);
        },
        async replace(input) {
            state.writes.push(structuredClone(input));
            if (state.replaceImpl) { return await state.replaceImpl(input); }
            state.persisted = structuredClone(input.candidate);
            return { status: 'confirmed' };
        },
        async delete() { return 'deleted'; },
    };
    const chatReferences = {
        hasPending: () => false,
        capture: () => structuredClone(state.capture),
        isCurrent: captured => captured.identityKey === state.capture.identityKey,
        async install(_captured, reference) {
            state.capture.reference = structuredClone(reference);
            return { status: 'confirmed' };
        },
    };
    const partitions = new XiaobaiOsPartitionRegistry();
    partitions.register(MAP_PARTITION);
    const coordinator = createTransactionCoordinator({
        storage,
        partitions,
        chatReferences,
        createId: () => `map_generated_${++id}`,
    });
    const store = coordinator.createScopedStore(MAP_PARTITION);
    const map = createMapService(store, coordinator);
    return { map, store, coordinator, state };
}
