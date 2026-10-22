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
import type { ChatReferencePort, ChatPersistence, CapturedChatBinding, PartitionRegistration, CapabilityToken, XiaobaiOsStoragePort, JsonUserFilePort } from '../kernel/contracts.js';
import { createUserTransactions, type UserTransactions } from '../kernel/user-transactions.js';
import { startSaveRecovery } from './save-recovery.js';
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
    user?: {
        storage: JsonUserFilePort;
        initialPartitions(): Promise<Record<string, unknown>>;
        resolveStory(write: boolean, chatPersistence?: ChatPersistence): Promise<CapturedChatBinding>;
    };
}

export interface KernelComposition {
    capabilities: CapabilityRegistry;
    apps: AppModuleRegistry;
    transactions: TransactionCoordinator;
    userTransactions: UserTransactions | null;
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
        for (const registration of module.additionalPartitions ?? []) { partitions.register(registration); }
    }
    const chatPartitions = new XiaobaiOsPartitionRegistry();
    const userPartitions = new XiaobaiOsPartitionRegistry();
    for (const registration of partitions.list()) {
        (registration.storage ? userPartitions : chatPartitions).register(registration);
    }
    const transactions = createTransactionCoordinator({
        storage: options.storage,
        partitions: chatPartitions,
        chatReferences: options.chatReferences,
        capabilityBinder: capabilities,
        createId: options.createId,
        beforeRead: options.beforeRead,
        prepareInitialPartitions: options.prepareInitialPartitions,
    });
    const userTransactions = options.user ? createUserTransactions({ ...options.user, partitions: userPartitions,
        binder: capabilities, references: options.chatReferences, createId: options.createId }) : null;
    const createStore = (registration: PartitionRegistration<unknown>, allowedCapabilities: readonly CapabilityToken<unknown>[]) => {
        if (registration.storage) {
            if (!userTransactions) { throw new Error('User storage is unavailable'); }
            return userTransactions.createStore(registration, allowedCapabilities);
        }
        return transactions.createScopedStore(registration, { allowedCapabilities });
    };
    const filesFor = (registration?: PartitionRegistration<unknown>, scope?: 'user') => {
        if (registration?.storage || scope === 'user') {
            if (!userTransactions) { throw new Error('User storage is unavailable'); }
            return userTransactions;
        }
        return transactions;
    };
    const apps = createAppModuleRegistry(options.modules, {
        createStore,
        hasCapability: token => capabilities.has(token),
        requireCapability: token => capabilities.require(token),
        files: transactions,
        filesFor,
    });

    const stopRecovery: (() => void)[] = [];
    return Object.freeze({
        capabilities,
        apps,
        transactions,
        userTransactions,
        async install() {
            stopRecovery.push(startSaveRecovery(transactions));
            if (userTransactions) { stopRecovery.push(startSaveRecovery(userTransactions)); }
            await capabilities.install({
                createStore,
                files: transactions,
                filesFor,
            });
            await apps.installAll();
        },
        async dispose() {
            for (const stop of stopRecovery.splice(0)) { stop(); }
            const errors: unknown[] = [];
            try { await apps.dispose(); } catch (error) { errors.push(error); }
            try { await capabilities.dispose(); } catch (error) { errors.push(error); }
            if (errors.length > 0) {
                throw new AggregateError(errors, 'Xiaobai OS Kernel composition disposal failed');
            }
        },
    });
}
