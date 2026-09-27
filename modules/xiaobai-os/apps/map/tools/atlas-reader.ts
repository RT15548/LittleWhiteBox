import type {
    MapActorPosition,
    MapDomainV1,
    MapLink,
    MapLinkKind,
    MapLocation,
    MapLocationStatus,
} from '../../../domains/map/types.js';
import { enumToken, intentId, isRecord } from './intent-common.js';
import { unassignedMapLocations, visitedMapLocationKeys } from '../../../domains/map/hierarchy.js';
import { mapToolResult, type MapToolResult } from './result.js';

const ATLAS_READ_MODES = ['summary', 'document', 'locations', 'links', 'actors'] as const;
const LOCATION_STATUSES: readonly MapLocationStatus[] = ['mentioned', 'visited'];
const LINK_KINDS: readonly MapLinkKind[] = ['door', 'stairs', 'elevator', 'path', 'road', 'portal', 'passage'];
const ALLOWED_ARGUMENTS = new Set([
    'mode', 'query', 'parent', 'status', 'from', 'to', 'kind', 'actorKey', 'limit', 'offset', 'needsRegion',
]);
export const DEFAULT_ATLAS_READ_LIMIT = 30;
export const MAX_ATLAS_READ_LIMIT = 300;
export const MAX_ATLAS_QUERY_LENGTH = 120;

/** Scene links are compiler-owned: the model learns whether a scene exists, never its key. */
type AgentMapLocation = Omit<MapLocation, 'sceneKey'> & { hasScene: boolean; needsRegion: boolean };

function projectLocation(location: MapLocation, unassigned: ReadonlySet<string>, visited: ReadonlySet<string>): AgentMapLocation {
    return {
        key: location.key,
        name: location.name,
        scale: location.scale,
        status: visited.has(location.key) ? 'visited' : location.status,
        hasScene: !!location.sceneKey,
        needsRegion: unassigned.has(location.key),
        ...(location.parent ? { parent: location.parent } : {}),
        ...(location.brief ? { brief: location.brief } : {}),
        ...(location.position ? { position: [...location.position] as [number, number] } : {}),
        ...(location.terrain ? { terrain: location.terrain } : {}),
    };
}

function normalizedText(value: unknown, field: string, maximum: number): string {
    if (value === undefined) {return '';}
    if (typeof value !== 'string') {throw new TypeError(`MapAtlasRead.${field} must be a string.`);}
    const normalized = value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
    if (Array.from(normalized).length > maximum) {
        throw new TypeError(`MapAtlasRead.${field} exceeds ${maximum} characters.`);
    }
    return normalized;
}

function optionalId(value: unknown, field: string): string {
    if (value === undefined) {return '';}
    const id = intentId(value);
    if (!id) {throw new TypeError(`MapAtlasRead.${field} must be a valid id.`);}
    return id;
}

function integerArgument(value: unknown, field: string, fallback: number, minimum: number, maximum: number): number {
    if (value === undefined) {return fallback;}
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
        throw new TypeError(`MapAtlasRead.${field} must be an integer from ${minimum} to ${maximum}.`);
    }
    return Number(value);
}

function page<T>(items: readonly T[], offset: number, limit: number): {
    count: number;
    returned: number;
    truncated: boolean;
    nextOffset: number | null;
    items: T[];
} {
    const values = items.slice(offset, offset + limit).map(item => structuredClone(item));
    const nextOffset = offset + values.length;
    return {
        count: items.length,
        returned: values.length,
        truncated: nextOffset < items.length,
        nextOffset: nextOffset < items.length ? nextOffset : null,
        items: values,
    };
}

function includesQuery(values: readonly (string | undefined)[], query: string): boolean {
    if (!query) {return true;}
    const needle = query.toLowerCase();
    return values.some(value => String(value || '').toLowerCase().includes(needle));
}

export function readAtlas(domain: MapDomainV1, value: unknown): MapToolResult {
    if (!isRecord(value)) {throw new TypeError('MapAtlasRead expects an object.');}
    const unknown = Object.keys(value).filter(key => !ALLOWED_ARGUMENTS.has(key));
    if (unknown.length) {throw new TypeError(`MapAtlasRead has unsupported fields: ${unknown.join(', ')}.`);}

    const mode = value.mode === undefined ? 'summary' : enumToken(value.mode, ATLAS_READ_MODES);
    if (!mode) {throw new TypeError('MapAtlasRead.mode is invalid.');}
    const revision = domain.revision;
    const unassigned = new Set(unassignedMapLocations(domain.atlas).map(location => location.key));
    const visited = visitedMapLocationKeys(domain.atlas);
    if (mode === 'summary') {
        return mapToolResult({
            data: {
                mode,
                revision,
                counts: {
                    locations: domain.atlas.locations.length,
                    links: domain.atlas.links.length,
                    actors: domain.atlas.actors.length,
                    needsRegion: unassigned.size,
                },
                player: structuredClone(domain.atlas.actors.find(actor => actor.actorKey === 'player') || null),
            },
        });
    }
    if (mode === 'document') {
        return mapToolResult({
            data: {
                mode,
                revision,
                atlas: {
                    locations: domain.atlas.locations.map(location => projectLocation(location, unassigned, visited)),
                    links: structuredClone(domain.atlas.links),
                    actors: structuredClone(domain.atlas.actors),
                },
            },
        });
    }

    const query = normalizedText(value.query, 'query', MAX_ATLAS_QUERY_LENGTH);
    const offset = integerArgument(value.offset, 'offset', 0, 0, Number.MAX_SAFE_INTEGER);
    const limit = integerArgument(value.limit, 'limit', DEFAULT_ATLAS_READ_LIMIT, 1, MAX_ATLAS_READ_LIMIT);
    if (mode === 'locations') {
        if (value.needsRegion !== undefined && typeof value.needsRegion !== 'boolean') {throw new TypeError('MapAtlasRead.needsRegion must be a boolean.');}
        const parent = optionalId(value.parent, 'parent');
        const status = value.status === undefined ? null : enumToken(value.status, LOCATION_STATUSES);
        if (value.status !== undefined && !status) {throw new TypeError('MapAtlasRead.status is invalid.');}
        const matches = domain.atlas.locations.filter((location: MapLocation) => (
            (!parent || location.parent === parent)
            && (!status || visited.has(location.key) === (status === 'visited'))
            && (value.needsRegion === undefined || unassigned.has(location.key) === value.needsRegion)
            && includesQuery([location.key, location.name, location.brief], query)
        ));
        const result = page(matches.map(location => projectLocation(location, unassigned, visited)), offset, limit);
        return mapToolResult({
            data: {
                mode, revision, count: result.count, returned: result.returned,
                truncated: result.truncated, nextOffset: result.nextOffset, locations: result.items,
            },
        });
    }
    if (mode === 'links') {
        const from = optionalId(value.from, 'from');
        const to = optionalId(value.to, 'to');
        const kind = value.kind === undefined ? null : enumToken(value.kind, LINK_KINDS);
        if (value.kind !== undefined && !kind) {throw new TypeError('MapAtlasRead.kind is invalid.');}
        const matches = domain.atlas.links.filter((link: MapLink) => (
            (!from || link.from === from || (link.bidirectional && link.to === from))
            && (!to || link.to === to || (link.bidirectional && link.from === to))
            && (!kind || link.kind === kind)
            && includesQuery([link.id, link.label, link.from, link.to], query)
        ));
        const result = page(matches, offset, limit);
        return mapToolResult({
            data: {
                mode, revision, count: result.count, returned: result.returned,
                truncated: result.truncated, nextOffset: result.nextOffset, links: result.items,
            },
        });
    }

    const actorKey = optionalId(value.actorKey, 'actorKey');
    const matches = domain.atlas.actors.filter((actor: MapActorPosition) => (
        (!actorKey || actor.actorKey === actorKey)
        && includesQuery([actor.actorKey, actor.displayName, actor.locationKey], query)
    ));
    const result = page(matches, offset, limit);
    return mapToolResult({
        data: {
            mode, revision, count: result.count, returned: result.returned,
            truncated: result.truncated, nextOffset: result.nextOffset, actors: result.items,
        },
    });
}
