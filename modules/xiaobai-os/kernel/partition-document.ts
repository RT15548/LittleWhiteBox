import type { PartitionRegistration, PartitionSnapshot, PartitionStore, PartitionValidationReport } from './contracts.js';
import { parseRegisteredPartition, XiaobaiOsPartitionError } from './partition-registry.js';
import { jsonValuesEqual } from '../host/json-values-equal.js';

/** Owner-scoped access to stored JSON. Validation is required for the replacement, not its predecessor. */
export function createPartitionDocument<T>(store: PartitionStore<T>, registration: PartitionRegistration<T>, prepare: (value: T, previous: unknown) => T = value => value) {
    function parseCandidate(value: unknown, expected?: PartitionSnapshot<unknown>) {
        const parsed = parseRegisteredPartition(registration, value);
        return expected && !jsonValuesEqual(value, expected.value)
            ? parseRegisteredPartition(registration, prepare(parsed, expected.value)) : parsed;
    }
    function validate(value: unknown, expected?: PartitionSnapshot<unknown>) {
        let error: { code: string; message: string } | null = null;
        let report: PartitionValidationReport | undefined;
        try { parseCandidate(value, expected); }
        catch (cause) {
            if ((cause as { code?: string })?.code !== 'partition_invalid') { throw cause; }
            error = { code: 'partition_invalid', message: (cause as Error).message };
            if (cause instanceof XiaobaiOsPartitionError) { report = cause.validation; }
        }
        return { valid: !error, schemaVersion: registration.schemaVersion, error, ...report };
    }
    return {
        validate,
        async read() {
            const snapshot = await store.readRaw();
            const present = snapshot.value !== undefined;
            return { snapshot, validation: { present, ...(present ? validate(snapshot.value) : { valid: true, schemaVersion: registration.schemaVersion, error: null }) } };
        },
        async replace(expected: PartitionSnapshot<unknown>, candidate: unknown, guard: () => boolean) {
            const next = parseCandidate(candidate, expected);
            const valid = () => {
                const binding = store.peekBinding();
                return binding?.identityKey === expected.identityKey && binding.osId === expected.osId && guard();
            };
            if (!valid()) { throw new Error('management_context_changed'); }
            return store.transact(transaction => {
                if (!valid()) { throw new Error('management_context_changed'); }
                if (!jsonValuesEqual(transaction.rawCurrent, expected.value)) { throw new Error('management_request_superseded'); }
                if (jsonValuesEqual(candidate, expected.value)) { return expected.value; }
                transaction.replace(next);
                return next;
            }, { commitGuard: valid });
        },
    };
}

export type PartitionDocument = ReturnType<typeof createPartitionDocument<unknown>>;
