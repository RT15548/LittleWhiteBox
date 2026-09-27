import type { PartitionRegistration } from '../../kernel/contracts.js';
import { parseMapDomain } from '../../domains/map/invariants.js';
import { createEmptyMapDomain } from '../../domains/map/state.js';
import type { MapDomainV1 } from '../../domains/map/types.js';
import { MAP_APP_DESCRIPTOR } from './descriptor.js';

export const MAP_PARTITION: PartitionRegistration<MapDomainV1> = Object.freeze({
    key: 'map',
    ownerId: MAP_APP_DESCRIPTOR.id,
    schemaVersion: 1,
    parse(value: unknown) {
        try { return { ok: true as const, value: parseMapDomain(value, 'partitions.map') }; }
        catch (error) {
            return {
                ok: false as const,
                error: {
                    code: 'partition_invalid' as const,
                    message: error instanceof Error ? error.message : 'Map partition is invalid',
                },
            };
        }
    },
    serialize: (value: MapDomainV1) => parseMapDomain(value, 'partitions.map'),
    createInitial: createEmptyMapDomain,
});
