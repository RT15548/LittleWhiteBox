import type {
    CapabilityToken,
    CapabilityTransactionAccess,
    PartitionRegistration,
    PartitionStore,
    XiaobaiOsFileControls,
} from './contracts.js';

export function createCapabilityToken<T>(id: string): CapabilityToken<T> {
    const normalized = String(id || '').trim();
    if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(normalized)) {
        throw new TypeError(`invalid capability id: ${id}`);
    }
    return Object.freeze({ id: normalized });
}

export interface CapabilityRegistration<T> {
    token: CapabilityToken<T>;
    ownerId: string;
    dependencies: readonly CapabilityToken<unknown>[];
    partition?: PartitionRegistration<unknown>;
    install?(context: CapabilityInstallContext): T | Promise<T>;
    bindTransaction?(context: CapabilityTransactionContext): T;
    dispose?(instance: T): void | Promise<void>;
}

export interface CapabilityInstallContext {
    require<C>(token: CapabilityToken<C>): C;
    partition: PartitionStore<unknown> | null;
    files: XiaobaiOsFileControls | null;
}

export interface CapabilityTransactionContext {
    requesterId: string;
    access: CapabilityTransactionAccess;
    require<C>(token: CapabilityToken<C>): C;
}

export interface CapabilityRegistry {
    install(options?: CapabilityRegistryInstallOptions): Promise<void>;
    has(token: CapabilityToken<unknown>): boolean;
    require<C>(token: CapabilityToken<C>): C;
    bind<C>(token: CapabilityToken<C>, requesterId: string, access: CapabilityTransactionAccess): C;
    dispose(): Promise<void>;
    registrations(): readonly CapabilityRegistration<unknown>[];
    partitions(): readonly PartitionRegistration<unknown>[];
}

export interface CapabilityRegistryInstallOptions {
    createStore?(
        registration: PartitionRegistration<unknown>,
        allowedCapabilities: readonly CapabilityToken<unknown>[],
    ): PartitionStore<unknown>;
    files?: XiaobaiOsFileControls;
    filesFor?(registration?: PartitionRegistration<unknown>): XiaobaiOsFileControls;
}

export function createCapabilityRegistry(
    input: readonly CapabilityRegistration<unknown>[],
): CapabilityRegistry {
    if (!Array.isArray(input)) { throw new TypeError('capability registrations must be an array'); }
    const byId = new Map<string, CapabilityRegistration<unknown>>();
    for (const registration of input) {
        if (
            !registration?.token?.id
            || !registration.ownerId
            || typeof registration.install !== 'function' && typeof registration.bindTransaction !== 'function'
        ) {
            throw new TypeError('invalid capability registration');
        }
        if (registration.partition && registration.partition.ownerId !== registration.ownerId) {
            throw new Error(
                `partition ${registration.partition.key} must be owned by capability ${registration.ownerId}`,
            );
        }
        if (byId.has(registration.token.id)) {
            throw new Error(`duplicate capability registration: ${registration.token.id}`);
        }
        byId.set(registration.token.id, registration);
    }
    for (const registration of input) {
        for (const dependency of registration.dependencies ?? []) {
            if (!byId.has(dependency.id)) {
                throw new Error(`missing capability dependency ${dependency.id} for ${registration.token.id}`);
            }
        }
    }

    const capabilityPartitions = new Map<string, PartitionRegistration<unknown>>();
    for (const registration of input) {
        if (!registration.partition) { continue; }
        if (capabilityPartitions.has(registration.partition.key)) {
            throw new Error(`duplicate capability partition: ${registration.partition.key}`);
        }
        capabilityPartitions.set(registration.partition.key, registration.partition);
    }

    const order: CapabilityRegistration<unknown>[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    function visit(id: string): void {
        if (visited.has(id)) { return; }
        if (visiting.has(id)) { throw new Error(`capability dependency cycle includes ${id}`); }
        visiting.add(id);
        const registration = byId.get(id);
        if (!registration) { throw new Error(`missing capability dependency: ${id}`); }
        for (const dependency of registration.dependencies ?? []) { visit(dependency.id); }
        visiting.delete(id);
        visited.add(id);
        order.push(registration);
    }
    for (const registration of input) { visit(registration.token.id); }

    const instances = new Map<string, unknown>();
    let installed = false;
    let installing: Promise<void> | null = null;

    async function install(installOptions: CapabilityRegistryInstallOptions = {}): Promise<void> {
        if (installed) { return; }
        if (installing) { return await installing; }
        installing = (async () => {
            try {
                for (const registration of order) {
                    if (!registration.install) { continue; }
                    if (registration.partition && !installOptions.createStore) {
                        throw new Error(`capability partition store is unavailable: ${registration.partition.key}`);
                    }
                    const allowed = new Set((registration.dependencies ?? []).map(dependency => dependency.id));
                    const instance = await registration.install({
                        partition: registration.partition
                            ? installOptions.createStore?.(registration.partition, registration.dependencies) ?? null
                            : null,
                        files: installOptions.filesFor?.(registration.partition) ?? installOptions.files ?? null,
                        require<C>(token: CapabilityToken<C>): C {
                            if (!allowed.has(token.id)) {
                                throw new Error(`${registration.token.id} did not declare dependency ${token.id}`);
                            }
                            if (!instances.has(token.id)) {
                                throw new Error(`capability dependency ${token.id} is not installed`);
                            }
                            return instances.get(token.id) as C;
                        },
                    });
                    instances.set(registration.token.id, instance);
                }
                installed = true;
            } catch (error) {
                for (const registration of [...order].reverse()) {
                    const instance = instances.get(registration.token.id);
                    if (instance !== undefined) {
                        try { await registration.dispose?.(instance); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "install" }, caughtError); }
                    }
                }
                instances.clear();
                throw error;
            } finally {
                installing = null;
            }
        })();
        return await installing;
    }

    function requireCapability<C>(token: CapabilityToken<C>): C {
        if (!installed) {
            throw new Error(`capability is not installed: ${token.id}`);
        }
        if (!instances.has(token.id)) {
            if (byId.has(token.id)) {
                throw Object.assign(new Error(`capability requires a transaction: ${token.id}`), {
                    code: 'capability_requires_transaction',
                    retryable: false,
                });
            }
            throw new Error(`capability is not registered: ${token.id}`);
        }
        return instances.get(token.id) as C;
    }

    function bindCapability<C>(
        token: CapabilityToken<C>,
        requesterId: string,
        access: CapabilityTransactionAccess,
    ): C {
        if (!installed) { throw new Error(`capability is not installed: ${token.id}`); }
        const cache = new Map<string, unknown>();
        const bindOne = <T>(target: CapabilityToken<T>): T => {
            if (cache.has(target.id)) { return cache.get(target.id) as T; }
            const registration = byId.get(target.id);
            if (!registration) {
                throw Object.assign(new Error(`capability is not registered: ${target.id}`), {
                    code: 'capability_unavailable',
                    retryable: false,
                });
            }
            if (!registration.bindTransaction) {
                const installedInstance = requireCapability(target);
                cache.set(target.id, installedInstance);
                return installedInstance;
            }
            const allowed = new Set((registration.dependencies ?? []).map(dependency => dependency.id));
            const instance = registration.bindTransaction({
                requesterId,
                access,
                require<D>(dependency: CapabilityToken<D>): D {
                    if (!allowed.has(dependency.id)) {
                        throw new Error(`${registration.token.id} did not declare dependency ${dependency.id}`);
                    }
                    return bindOne(dependency);
                },
            });
            cache.set(target.id, instance);
            return instance as T;
        };
        return bindOne(token);
    }

    async function dispose(): Promise<void> {
        const errors: unknown[] = [];
        for (const registration of [...order].reverse()) {
            const instance = instances.get(registration.token.id);
            if (instance === undefined) { continue; }
            try { await registration.dispose?.(instance); } catch (error) { errors.push(error); }
        }
        instances.clear();
        installed = false;
        if (errors.length > 0) { throw new AggregateError(errors, 'capability disposal failed'); }
    }

    return Object.freeze({
        install,
        has: (token: CapabilityToken<unknown>) => byId.has(token.id),
        require: requireCapability,
        bind: bindCapability,
        dispose,
        registrations: () => Object.freeze([...input]),
        partitions: () => Object.freeze([...capabilityPartitions.values()]),
    });
}
