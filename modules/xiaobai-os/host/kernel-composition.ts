import {
    createCapabilityRegistry,
    type CapabilityRegistration,
    type CapabilityRegistry,
} from '../kernel/capability-registry.js';
import {
    createAppModuleRegistry,
    type AppModuleRegistry,
    type XiaobaiOsAppModule,
} from '../kernel/app-registry.js';
import type { ChatReferencePort, XiaobaiOsStoragePort } from '../kernel/contracts.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import {
    createTransactionCoordinator,
    type TransactionCoordinator,
    type TransactionCoordinatorOptions,
} from '../kernel/transaction-coordinator.js';

export interface KernelCompositionOptions {
    storage: XiaobaiOsStoragePort;
    chatReferences: ChatReferencePort;
    capabilities: readonly CapabilityRegistration<unknown>[];
    modules: readonly XiaobaiOsAppModule[];
    createId?: TransactionCoordinatorOptions['createId'];
    beforeRead?: TransactionCoordinatorOptions['beforeRead'];
    prepareInitialPartitions?: TransactionCoordinatorOptions['prepareInitialPartitions'];
}

export interface KernelComposition {
    capabilities: CapabilityRegistry;
    apps: AppModuleRegistry;
    transactions: TransactionCoordinator;
    install(): Promise<void>;
    dispose(): Promise<void>;
}

export function createKernelComposition(
    options: KernelCompositionOptions,
): KernelComposition {
    const capabilities = createCapabilityRegistry(options.capabilities);
    const partitions = new XiaobaiOsPartitionRegistry();
    for (const registration of capabilities.partitions()) { partitions.register(registration); }
    for (const module of options.modules) {
        if (module.partition) { partitions.register(module.partition); }
    }
    const transactions = createTransactionCoordinator({
        storage: options.storage,
        partitions,
        chatReferences: options.chatReferences,
        capabilityBinder: capabilities,
        createId: options.createId,
        beforeRead: options.beforeRead,
        prepareInitialPartitions: options.prepareInitialPartitions,
    });
    const apps = createAppModuleRegistry(options.modules, {
        createStore: (registration, allowedCapabilities) =>
            transactions.createScopedStore(registration, { allowedCapabilities }),
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: transactions,
    });

    return Object.freeze({
        capabilities,
        apps,
        transactions,
        async install() {
            await capabilities.install({
                createStore: (registration, allowedCapabilities) =>
                    transactions.createScopedStore(registration, { allowedCapabilities }),
                files: transactions,
            });
            await apps.installAll();
        },
        async dispose() {
            const errors: unknown[] = [];
            try { await apps.dispose(); } catch (error) { errors.push(error); }
            try { await capabilities.dispose(); } catch (error) { errors.push(error); }
            if (errors.length > 0) {
                throw new AggregateError(errors, 'Xiaobai OS Kernel composition disposal failed');
            }
        },
    });
}
