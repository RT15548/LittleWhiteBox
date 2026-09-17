import type { PartitionRegistration } from '../../kernel/contracts.js';
import { parseWorld } from '../../domains/world/invariants.js';
import { createEmptyWorld, type WorldDomain } from '../../domains/world/types.js';
import { readWorldFile } from './storage/upgrade.js';

export const WORLD_PARTITION: PartitionRegistration<WorldDomain> = Object.freeze({
    key: 'world', ownerId: 'world', schemaVersion: 2,
    parse(value: unknown) {
        try { return { ok: true as const, value: readWorldFile(value) }; }
        catch (error) {
            return { ok: false as const, error: { code: 'partition_invalid' as const,
                message: error instanceof Error ? error.message : 'Invalid world publication' } };
        }
    },
    serialize: parseWorld,
    createInitial: createEmptyWorld,
});
