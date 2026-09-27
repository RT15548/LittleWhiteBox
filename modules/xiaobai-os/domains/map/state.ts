import { MAP_DOMAIN_SCHEMA_VERSION, parseMapDomain } from './invariants.js';
import type { MapDomainV1 } from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function createEmptyMapDomain(): MapDomainV1 {
    return {
        schemaVersion: MAP_DOMAIN_SCHEMA_VERSION,
        revision: 0,
        atlas: { locations: [], links: [], actors: [] },
        scenes: {},
    };
}

/** Reads a validated clone without coupling this domain to the host root type. */
export function readMapDomain(root: unknown): MapDomainV1 | null {
    if (!isRecord(root) || !isRecord(root.domains) || !Object.hasOwn(root.domains, 'map')) {return null;}
    return parseMapDomain(root.domains.map);
}
