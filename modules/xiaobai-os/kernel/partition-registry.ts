import type { PartitionParseResult, PartitionRegistration, PartitionValidationReport } from './contracts.js';
import { assertJsonValue, cloneJsonValue } from './envelope.js';

const PARTITION_KEY = /^[A-Za-z][A-Za-z0-9._-]*$/;
const OWNER_ID = /^[A-Za-z][A-Za-z0-9._-]*$/;

export class XiaobaiOsPartitionError extends Error {
    readonly code = 'partition_invalid';

    constructor(
        message: string,
        readonly partitionKey: string,
        readonly ownerId: string,
        options: { cause?: unknown; validation?: PartitionValidationReport } = {},
    ) {
        super(message, options);
        this.name = 'XiaobaiOsPartitionError';
        this.validation = options.validation;
    }

    readonly validation?: PartitionValidationReport;
}

export class XiaobaiOsPartitionRegistry {
    readonly #registrations = new Map<string, PartitionRegistration<unknown>>();

    register<T>(registration: PartitionRegistration<T>): void {
        if (!registration || typeof registration !== 'object') {
            throw new TypeError('partition registration must be an object');
        }
        if (!PARTITION_KEY.test(registration.key)) {
            throw new TypeError(`invalid partition key: ${registration.key}`);
        }
        if (!OWNER_ID.test(registration.ownerId)) {
            throw new TypeError(`invalid partition owner: ${registration.ownerId}`);
        }
        if (!Number.isSafeInteger(registration.schemaVersion) || registration.schemaVersion < 1) {
            throw new TypeError(`partition ${registration.key} must declare a positive schemaVersion`);
        }
        if (
            typeof registration.parse !== 'function'
            || typeof registration.serialize !== 'function'
            || typeof registration.createInitial !== 'function'
        ) {
            throw new TypeError(`partition ${registration.key} has an incomplete contract`);
        }
        if (this.#registrations.has(registration.key)) {
            throw new Error(`duplicate partition registration: ${registration.key}`);
        }
        this.#registrations.set(registration.key, registration as PartitionRegistration<unknown>);
    }

    unregister(key: string, ownerId: string): boolean {
        const current = this.#registrations.get(key);
        if (!current) { return false; }
        if (current.ownerId !== ownerId) {
            throw new Error(`partition ${key} is owned by ${current.ownerId}, not ${ownerId}`);
        }
        return this.#registrations.delete(key);
    }

    get<T>(key: string): PartitionRegistration<T> | null {
        return (this.#registrations.get(key) as PartitionRegistration<T> | undefined) ?? null;
    }

    require<T>(key: string): PartitionRegistration<T> {
        const registration = this.get<T>(key);
        if (!registration) { throw new Error(`partition is not registered: ${key}`); }
        return registration;
    }

    assertRegistered<T>(registration: PartitionRegistration<T>): void {
        if (this.#registrations.get(registration.key) !== registration) {
            throw new Error(`partition registration is not installed: ${registration.key}`);
        }
    }

    list(): readonly PartitionRegistration<unknown>[] {
        return Object.freeze([...this.#registrations.values()]);
    }
}

export function parseRegisteredPartition<T>(registration: PartitionRegistration<T>, raw: unknown): T {
    let result: PartitionParseResult<T>;
    try {
        result = registration.parse(cloneJsonValue(raw));
    } catch (cause) {
        throw new XiaobaiOsPartitionError(
            `partition ${registration.key} parser threw`,
            registration.key,
            registration.ownerId,
            { cause },
        );
    }
    if (!result || result.ok !== true) {
        const message = result && result.ok === false ? result.error.message : 'partition parser returned an invalid result';
        throw new XiaobaiOsPartitionError(message, registration.key, registration.ownerId,
            { validation: result && result.ok === false ? result.error.validation : undefined });
    }
    return result.value;
}

export function createRegisteredPartitionInitial<T>(registration: PartitionRegistration<T>): T {
    try {
        return cloneJsonValue(registration.serialize(registration.createInitial())) as T;
    } catch (cause) {
        throw new XiaobaiOsPartitionError(
            `partition ${registration.key} initial value is invalid`,
            registration.key,
            registration.ownerId,
            { cause },
        );
    }
}

export function serializeRegisteredPartition<T>(registration: PartitionRegistration<T>, value: T): unknown {
    try {
        const serialized = registration.serialize(value);
        assertJsonValue(serialized, `partitions.${registration.key}`);
        return cloneJsonValue(serialized);
    } catch (cause) {
        if (cause instanceof XiaobaiOsPartitionError) { throw cause; }
        throw new XiaobaiOsPartitionError(
            `partition ${registration.key} could not be serialized`,
            registration.key,
            registration.ownerId,
            { cause },
        );
    }
}
