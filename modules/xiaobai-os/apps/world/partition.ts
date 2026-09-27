import type { PartitionRegistration } from '../../kernel/contracts.js';
import { parseWorld, WorldValidationError } from '../../domains/world/invariants.js';
import { createEmptyWorld, WORLD_VERSION, type WorldDomain } from '../../domains/world/types.js';
import { readWorldFile } from './storage/upgrade.js';

export const WORLD_PARTITION: PartitionRegistration<WorldDomain> = Object.freeze({
    key: 'world', ownerId: 'world', schemaVersion: WORLD_VERSION,
    parse(value: unknown) {
        try { return { ok: true as const, value: readWorldFile(value) }; }
        catch (error) {
            return { ok: false as const, error: { code: 'partition_invalid' as const,
                message: error instanceof Error ? error.message : 'Invalid world publication',
                ...(error instanceof WorldValidationError && error.issues ? { validation: { issues: error.issues, unchecked: ['publication'] } } : {}) } };
        }
    },
    serialize: parseWorld,
    createInitial: createEmptyWorld,
});
