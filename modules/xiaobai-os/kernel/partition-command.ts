import type { CapabilityToken, CapabilityTransactionAccess, PartitionRegistration, ScopedTransaction } from './contracts.js';
import { cloneJsonValue } from './envelope.js';
import { createRegisteredPartitionInitial, parseRegisteredPartition, serializeRegisteredPartition, type XiaobaiOsPartitionRegistry } from './partition-registry.js';
import type { TransactionCapabilityBinder } from './transaction-coordinator.js';

/** Shared staging/authorization for chat and user transactions. Nothing here performs I/O. */
export function preparePartitionCommand<T>(options: {
    registration: PartitionRegistration<T>;
    partitions: XiaobaiOsPartitionRegistry;
    binder?: TransactionCapabilityBinder;
    allowedCapabilities: readonly CapabilityToken<unknown>[];
    readRaw(registration: PartitionRegistration<unknown>): unknown;
    assertAccess?(registration: PartitionRegistration<unknown>): void;
    scopeId?: string;
}) {
    const { registration, partitions } = options;
    const replacements = new Map<string, unknown>();
    const parsed = new Map<string, unknown>();
    const capabilities = new Map<string, unknown>();
    const allowed = new Set(options.allowedCapabilities.map(token => token.id));
    const access: CapabilityTransactionAccess = {
        scopeId: options.scopeId,
        readPartition<P>(target: PartitionRegistration<P>): P | null {
            partitions.assertRegistered(target);
            options.assertAccess?.(target);
            if (replacements.has(target.key)) { return parseRegisteredPartition(target, replacements.get(target.key)); }
            if (!parsed.has(target.key)) {
                const raw = options.readRaw(target);
                if (raw === undefined) { return null; }
                parsed.set(target.key, parseRegisteredPartition(target, raw));
            }
            return cloneJsonValue(parsed.get(target.key)) as P;
        },
        replacePartition<P>(target: PartitionRegistration<P>, value: P) {
            partitions.assertRegistered(target);
            options.assertAccess?.(target);
            replacements.set(target.key, serializeRegisteredPartition(target, value));
        },
    };
    let current: T | null;
    let hasCurrent = false;
    const readCurrent = () => {
        if (!hasCurrent) { current = access.readPartition(registration); hasCurrent = true; }
        return current;
    };
    const context: ScopedTransaction<T> = {
        get rawCurrent() { return structuredClone(options.readRaw(registration)); },
        get current() { return readCurrent(); },
        currentOrInitial() {
            const value = readCurrent();
            return value === null ? createRegisteredPartitionInitial(registration) : cloneJsonValue(value);
        },
        replace: next => access.replacePartition(registration, next),
        useCapability<C>(token: CapabilityToken<C>): C {
            if (!allowed.has(token.id)) {
                throw Object.assign(new Error(`${registration.ownerId} did not declare capability ${token.id}`), { code: 'capability_not_authorized' });
            }
            if (!options.binder) { throw Object.assign(new Error(`Capability ${token.id} is unavailable`), { code: 'capability_unavailable' }); }
            if (!capabilities.has(token.id)) { capabilities.set(token.id, options.binder.bind(token, registration.ownerId, access)); }
            return capabilities.get(token.id) as C;
        },
    };
    return { context, replacements };
}
