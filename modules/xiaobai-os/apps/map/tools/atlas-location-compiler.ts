import type { MapDomainEdit } from '../../../domains/map/edit.js';
import { isMapSceneLocation, locationRegion, unassignedMapLocations } from '../../../domains/map/hierarchy.js';
import { MAX_MAP_BRIEF_LENGTH } from '../../../domains/map/invariants.js';
import type { MapAtlas, MapDomainV1, MapLocation, MapLocationScale, MapLocationStatus } from '../../../domains/map/types.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import { MAP_REGION_REQUIRED_HINT, MAP_SCENE_LOCATION_REQUIRED_HINT } from './hierarchy-feedback.js';
import { applyIntentEdits, enumToken, errorText, intentId, intentText, isRecord } from './intent-common.js';
import type { MapToolItemReport } from './result.js';

const LOCATION_SCALES: readonly MapLocationScale[] = ['world', 'region', 'city', 'district', 'building', 'floor', 'room', 'outdoor'];
const LOCATION_STATUSES: readonly MapLocationStatus[] = ['mentioned', 'visited'];
const LOCATION_FIELDS = new Set(['key', 'name', 'scale', 'status', 'parent', 'brief', 'position', 'terrain']);
const LOCATION_EDIT_HINT = 'Correct the related location declarations and their parent references, then retry them together.';
const LOCATION_REQUIRED_HINT = 'Provide key/name and an existing or same-call parent.';

type LocationIntent = { raw: unknown; index: number; id: string };

/** Edited ancestors and descendants share a transaction, including paths through untouched places. */
function locationGroups(atlas: MapAtlas, values: readonly unknown[]): LocationIntent[][] {
    const entries = values.map((raw, index) => ({ raw, index, id: isRecord(raw) ? intentId(raw.key) : '' }));
    const parents = new Map(atlas.locations.map(location => [location.key, new Set(location.parent ? [location.parent] : [])]));
    const related = new Map(entries.filter(entry => entry.id).map(entry => [entry.id, new Set<string>()]));
    for (const { raw, id } of entries) {
        if (!id || !isRecord(raw)) {continue;}
        const parent = intentId(raw.parent);
        if (parent) {
            if (!parents.has(id)) {parents.set(id, new Set());}
            parents.get(id)!.add(parent);
        }
    }
    // Use both the existing and requested parent edges: detaching an old ancestor can
    // depend on moving a descendant elsewhere. Requested edges may themselves form cycles.
    for (const [id, neighbors] of related) {
        const visited = new Set([id]);
        const pending = [...(parents.get(id) || [])];
        while (pending.length) {
            const ancestor = pending.pop()!;
            if (visited.has(ancestor)) {continue;}
            visited.add(ancestor);
            if (related.has(ancestor)) {
                neighbors.add(ancestor);
                related.get(ancestor)!.add(id);
            }
            pending.push(...(parents.get(ancestor) || []));
        }
    }
    const remaining = new Set(related.keys());
    const groups = entries.filter(entry => !entry.id).map(entry => [entry]);
    for (const id of remaining) {
        const keys = new Set([id]);
        for (const key of keys) {
            remaining.delete(key);
            for (const neighbor of related.get(key)!) {keys.add(neighbor);}
        }
        groups.push(entries.filter(entry => keys.has(entry.id)));
    }
    return groups.sort((a, b) => a[0].index - b[0].index);
}

export function compileAtlasLocations(current: MapDomainV1, values: readonly unknown[]) {
    let domain = current;
    let changed = false;
    const edits: MapDomainEdit[] = [];
    const applied: MapToolItemReport[] = [];
    const skipped: MapToolItemReport[] = [];
    for (const group of locationGroups(current.atlas, values)) {
        const locations = new Map(domain.atlas.locations.map(location => [location.key, location]));
        const groupEdits: MapDomainEdit[] = [];
        const failures = new Map<number, { reason: string; hint: string }>();
        for (const { raw, index, id } of group) {
            const unknown = isRecord(raw) ? Object.keys(raw).filter(key => !LOCATION_FIELDS.has(key)) : [];
            const name = isRecord(raw) ? intentText(raw.name) : '';
            if (unknown.length) {
                failures.set(index, { reason: 'location_has_unsupported_fields', hint: `Remove unsupported fields: ${unknown.join(', ')}.` });
                continue;
            }
            if (!isRecord(raw) || !id || !name) {
                failures.set(index, { reason: 'location_invalid_or_parent_missing', hint: LOCATION_REQUIRED_HINT });
                continue;
            }
            const existing = locations.get(id);
            const scale = enumToken(raw.scale, LOCATION_SCALES) || existing?.scale || 'room';
            const status = enumToken(raw.status, LOCATION_STATUSES) || existing?.status || 'mentioned';
            const location: MapLocation = { ...existing, key: id, name, scale, status };
            const parent = intentId(raw.parent);
            if (parent) {location.parent = parent;} else if (raw.parent === null || raw.parent === '') {delete location.parent;}
            const brief = intentText(raw.brief, '', MAX_MAP_BRIEF_LENGTH);
            if (brief) {location.brief = brief;}
            // Validate authored geography with the complete candidate; never guess a replacement.
            if (raw.position === null) {delete location.position;}
            else if (raw.position !== undefined) {location.position = raw.position as MapLocation['position'];}
            if (raw.terrain === null) {delete location.terrain;}
            else if (raw.terrain !== undefined) {location.terrain = raw.terrain as MapLocation['terrain'];}
            locations.set(id, location);
            groupEdits.push({ op: 'upsert-location', location });
        }
        const reject = (reason: string, hint: string) => {
            for (const { index, id } of group) {
                skipped.push({ collection: 'locations', index, id, ...(failures.get(index) || { reason, hint }) });
            }
        };
        if (failures.size) {
            reject('location_group_invalid', LOCATION_EDIT_HINT);
            continue;
        }
        try {
            const next = applyIntentEdits(domain, groupEdits);
            const keys = new Set(group.map(entry => entry.id));
            if (next.domain.atlas.locations.some(location => keys.has(location.key) && location.sceneKey && !isMapSceneLocation(location))) {
                reject('scene_location_required', MAP_SCENE_LOCATION_REQUIRED_HINT);
                continue;
            }
            if (unassignedMapLocations(next.domain.atlas).some(location => keys.has(location.key) || locationRegion(domain.atlas, location.key))) {
                reject('location_region_required', MAP_REGION_REQUIRED_HINT);
                continue;
            }
            for (const { index, id } of group) {
                const before = domain.atlas.locations.find(location => location.key === id);
                const after = next.domain.atlas.locations.find(location => location.key === id);
                applied.push({ collection: 'locations', index, id, changed: !jsonValuesEqual(before, after) });
            }
            domain = next.domain;
            changed ||= next.changed;
            edits.push(...groupEdits);
        } catch (error) {
            reject(errorText(error), LOCATION_EDIT_HINT);
        }
    }
    return { domain, changed, edits, applied, skipped };
}
