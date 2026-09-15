import type { PartitionRegistration } from '../../kernel/contracts.js';

export interface DicePartition { schemaVersion: 1; actionChecksEnabled: boolean; encountersEnabled: boolean }

function parseDicePartition(value: unknown): DicePartition {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError('dice_partition_invalid'); }
    const input = value as Record<string, unknown>;
    if (input.schemaVersion !== 1 || typeof input.actionChecksEnabled !== 'boolean' || typeof input.encountersEnabled !== 'boolean' || Object.keys(input).length !== 3) {
        throw new TypeError('dice_partition_invalid');
    }
    return { schemaVersion: 1, actionChecksEnabled: input.actionChecksEnabled, encountersEnabled: input.encountersEnabled };
}

export const DICE_PARTITION: PartitionRegistration<DicePartition> = Object.freeze({
    key: 'dice', ownerId: 'dice', schemaVersion: 1,
    parse(value: unknown) {
        try { return { ok: true as const, value: parseDicePartition(value) }; }
        catch (error) {
            return { ok: false as const, error: { code: 'partition_invalid' as const, message: (error as Error).message } };
        }
    },
    serialize: parseDicePartition,
    createInitial: () => ({ schemaVersion: 1 as const, actionChecksEnabled: false, encountersEnabled: false }),
});
