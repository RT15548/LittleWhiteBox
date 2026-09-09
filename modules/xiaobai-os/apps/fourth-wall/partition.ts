import type { PartitionRegistration } from '../../kernel/contracts.js';
import { createDefaultFourthWallChatState } from './domain/defaults.js';
import { parseFourthWallChatState } from './domain/state.js';
import type { FourthWallPartition } from './types.js';
import { parseFourthWallChatStateV1, type FourthWallPartitionV1 } from './upgrade/partition-v1.js';
import { FOURTH_WALL_APP_DESCRIPTOR } from './descriptor.js';

// Historical shapes stay inside the storage boundary, never in domain/controller state.
export type FourthWallStoredPartition = FourthWallPartition | FourthWallPartitionV1;

function parsePartition(value: unknown): FourthWallStoredPartition {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('partitions.fourthWall must be an object');
    }
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    if (keys.length !== 2 || keys[0] !== 'schemaVersion' || keys[1] !== 'state') {
        throw new TypeError('partitions.fourthWall has non-canonical fields');
    }
    if (record.schemaVersion === 1) {
        return { schemaVersion: 1, state: parseFourthWallChatStateV1(record.state) };
    }
    if (record.schemaVersion === 2) {
        return { schemaVersion: 2, state: parseFourthWallChatState(record.state) };
    }
    throw new TypeError('partitions.fourthWall has an unsupported schemaVersion');
}

export const FOURTH_WALL_PARTITION: PartitionRegistration<FourthWallStoredPartition> = Object.freeze({
    key: 'fourthWall',
    ownerId: FOURTH_WALL_APP_DESCRIPTOR.id,
    schemaVersion: 2,
    parse(value: unknown) {
        try { return { ok: true as const, value: parsePartition(value) }; }
        catch (error) {
            return {
                ok: false as const,
                error: {
                    code: 'partition_invalid' as const,
                    message: error instanceof Error ? error.message : 'Fourth Wall partition is invalid',
                },
            };
        }
    },
    serialize: parsePartition,
    createInitial: () => ({ schemaVersion: 2 as const, state: createDefaultFourthWallChatState(Date.now()) }),
});
