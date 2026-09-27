import { sha256 } from 'js-sha256';
import type { AcceptedTurnPlayer } from '../../../capabilities/maintenance/accepted-turn-source.js';
import { stageMapDomainEdits, type MapDomainEdit } from '../../../domains/map/edit.js';
import { isMapSceneLocation, locationRegion, unassignedMapLocations } from '../../../domains/map/hierarchy.js';
import { MAX_MAP_ACTORS, MAX_MAP_LABEL_LENGTH, MAX_MAP_LINKS, MAX_MAP_LOCATIONS } from '../../../domains/map/invariants.js';
import type { MapDomain, MapLink } from '../../../domains/map/types.js';
import { MAX_MAP_FEATURES, MAX_MAP_FRAMES } from '../../../domains/map/space/types.js';
import { mapFrameId } from '../../../domains/map/space/frames.js';
import { atlasBaseGaps } from '../../../domains/map/space/coverage.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import { compileLocationDeclaration } from './atlas-location-compiler.js';
import { compileFeatureDeclaration, compileFrameDeclaration, mapOwner } from './atlas-spatial-compiler.js';
import { atlasEditGroups } from './atlas-dependencies.js';
import { actorMoveEdits, atlasRemovalEdits } from './atlas-removals.js';
import { applyIntentEdits, errorText, intentId, intentText, isRecord } from './intent-common.js';
import { mapToolResult, type MapToolItemReport, type MapToolResult } from './result.js';
import { MAP_REGION_REQUIRED_HINT, MAP_SCENE_LOCATION_REQUIRED_HINT } from './hierarchy-feedback.js';

export interface AtlasIntentCompileResult { readonly domain: MapDomain; readonly edits: readonly MapDomainEdit[]; readonly result: MapToolResult }
interface Entry { collection: string; index: number; id: string; target: string; refs: string[]; raw: unknown; edits: MapDomainEdit[]; error?: string }
const COLLECTIONS = [
    ['locations', 'key', 'location', MAX_MAP_LOCATIONS],
    ['maps', 'map', 'frame', MAX_MAP_FRAMES],
    ['features', 'id', 'feature', MAX_MAP_FEATURES],
    ['links', 'id', 'link', MAX_MAP_LINKS],
    ['actors', 'actorKey', 'actor', MAX_MAP_ACTORS],
] as const;
const REMOVALS = [
    ['locationKeys', 'location', MAX_MAP_LOCATIONS], ['maps', 'frame', MAX_MAP_FRAMES],
    ['featureIds', 'feature', MAX_MAP_FEATURES], ['linkIds', 'link', MAX_MAP_LINKS], ['actorKeys', 'actor', MAX_MAP_ACTORS],
] as const;
const GROUP_HINT = 'Correct the related declarations and retry them together. The related group was not changed.';
function stableLinkId(raw: Record<string, unknown>): string {
    const bidirectional = raw.bidirectional !== false, from = intentId(raw.from), to = intentId(raw.to);
    const endpoints = bidirectional ? [from, to].sort() : [from, to];
    return from && to && raw.kind ? `link:${sha256(JSON.stringify([bidirectional, ...endpoints, raw.kind]))}` : '';
}
function references(collection: string, raw: unknown): string[] {
    if (!isRecord(raw)) { return []; }
    const refs: string[] = [];
    const loc = (value: unknown) => { const key = intentId(value); if (key) { refs.push(`location:${key}`); } };
    const map = (value: unknown) => { const key = intentId(value); if (value === null || key) { refs.push(`frame:${mapFrameId(key || null)}`); loc(value); } };
    const feature = (value: unknown) => { if (typeof value === 'string') { refs.push(`feature:${value}`); } };
    if (collection === 'locations') { loc(raw.parent); if (isRecord(raw.position)) { map(raw.position.map); } if (Object.hasOwn(raw, 'reframe')) { map(raw.reframe); } }
    if (collection === 'maps') { loc(raw.map); if (isRecord(raw.mapping)) { map(raw.mapping.map); } feature(raw.boundary); }
    if (collection === 'features') { loc(raw.owner); map(raw.map); map(raw.reframe); loc(raw.destination); feature(raw.support); if (Array.isArray(raw.crosses)) { raw.crosses.forEach(feature); } }
    if (collection === 'links') { loc(raw.from); loc(raw.to); feature(raw.feature); }
    if (collection === 'actors') { loc(raw.locationKey); }
    return refs;
}
function targetValue(domain: MapDomain, entry: Entry): unknown {
    const [kind, ...rest] = entry.target.split(':'), id = rest.join(':');
    if (kind === 'location') { return domain.atlas.locations.find(l => l.key === id); }
    if (kind === 'frame') { return domain.atlas.frames.find(f => f.id === id); }
    if (kind === 'feature') { return domain.atlas.features.find(f => f.id === id); }
    if (kind === 'link') { return domain.atlas.links.find(l => l.id === id); }
    return domain.atlas.actors.find(a => a.actorKey === id);
}
function prepareEntry(domain: MapDomain, entry: Entry, player: AcceptedTurnPlayer): MapDomainEdit[] {
    if (!isRecord(entry.raw)) { throw new Error('atlas_item_must_be_object'); }
    const raw = entry.raw;
    if (entry.collection === 'locations') { return [{ op: 'upsert-location', location: compileLocationDeclaration(domain, raw) }]; }
    if (entry.collection === 'maps') { return [{ op: 'upsert-frame', frame: compileFrameDeclaration(domain, raw) }]; }
    if (entry.collection === 'features') { return [{ op: 'upsert-feature', feature: compileFeatureDeclaration(domain, raw) }]; }
    if (entry.collection === 'links') {
        if (Object.keys(raw).some(k => !['id', 'from', 'to', 'kind', 'label', 'bidirectional', 'feature'].includes(k))) { throw new Error('link_has_unsupported_fields'); }
        const from = intentId(raw.from), to = intentId(raw.to), kind = raw.kind as MapLink['kind'];
        if (!from || !to || !kind || !entry.id) { throw new Error('link_requires_from_to_kind'); }
        const bidirectional = raw.bidirectional === undefined ? true : raw.bidirectional as boolean;
        const ends = bidirectional ? [from, to].sort() : [from, to];
        const existing = domain.atlas.links.find(l => l.id === entry.id);
        const link: MapLink = { ...existing, id: entry.id, from: ends[0], to: ends[1], kind, bidirectional };
        if (raw.label === null) { delete link.label; }
        else if (raw.label !== undefined) { link.label = intentText(raw.label, '', MAX_MAP_LABEL_LENGTH); }
        if (raw.feature === null) { delete link.feature; }
        else if (raw.feature !== undefined) { link.feature = intentId(raw.feature); }
        return [{ op: 'upsert-link', link }];
    }
    if (Object.keys(raw).some(k => !['actorKey', 'displayName', 'locationKey'].includes(k))) { throw new Error('actor_has_unsupported_fields'); }
    const locationKey = intentId(raw.locationKey), actorKey = entry.id;
    if (!actorKey || !locationKey) { throw new Error('actor_requires_actorKey_and_locationKey'); }
    const displayName = actorKey === 'player' ? player.displayName : intentText(raw.displayName, domain.atlas.actors.find(a => a.actorKey === actorKey)?.displayName || actorKey);
    return actorMoveEdits(domain, { actorKey, displayName, locationKey });
}
function removals(domain: MapDomain, entries: Entry[]): MapDomainEdit[] {
    if (entries.some(e => !e.id)) { throw new Error('atlas_removal_id_required'); }
    const ids = (collection: string) => entries.filter(e => e.collection === `remove.${collection}`).map(e => e.id);
    return atlasRemovalEdits(domain, { locations: ids('locationKeys'), frames: ids('maps'), features: ids('featureIds'), links: ids('linkIds'), actors: ids('actorKeys') });
}

export function compileAtlasIntent(current: MapDomain, value: unknown, player: AcceptedTurnPlayer): AtlasIntentCompileResult {
    const fail = (reason: string): AtlasIntentCompileResult => ({ domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: '', reason }] }) });
    if (!isRecord(value)) { return fail('arguments_must_be_object'); }
    if (Object.keys(value).some(k => ![...COLLECTIONS.map(c => c[0]), 'remove'].includes(k))) { return fail('atlas_has_unsupported_fields'); }
    if (value.remove !== undefined && !isRecord(value.remove)) { return fail('atlas_remove_must_be_object'); }
    const removed = isRecord(value.remove) ? value.remove : {};
    if (Object.keys(removed).some(k => !REMOVALS.some(r => r[0] === k))) { return fail('atlas_remove_has_unsupported_fields'); }
    const entries: Entry[] = [];
    for (const [collection, key, kind, limit] of COLLECTIONS) {
        const values = value[collection];
        if (values === undefined) { continue; }
        if (!Array.isArray(values)) { return fail('atlas_collection_must_be_array'); }
        if (values.length > limit) { return fail('atlas_collection_exceeds_limit'); }
        values.forEach((raw, index) => {
            let id = isRecord(raw) ? intentId(raw[key]) : '';
            if (collection === 'maps' && isRecord(raw) && (raw.map === null || intentId(raw.map))) { id = mapFrameId(intentId(raw.map) || null); }
            if (collection === 'links' && !id && isRecord(raw)) { id = stableLinkId(raw); }
            if (collection === 'actors' && id === 'user') { id = 'player'; }
            entries.push({ collection, index, id, target: `${kind}:${id || '?'+index}`, refs: references(collection, raw), raw, edits: [] });
        });
    }
    for (const [name, kind, limit] of REMOVALS) {
        const values = removed[name];
        if (values === undefined) { continue; }
        if (!Array.isArray(values)) { return fail('atlas_collection_must_be_array'); }
        if (values.length > limit) { return fail('atlas_collection_exceeds_limit'); }
        values.forEach((raw, index) => {
            let id = name === 'maps' && (raw === null || intentId(raw)) ? mapFrameId(intentId(raw) || null) : intentId(raw);
            if (name === 'actorKeys' && id === 'user') { id = 'player'; }
            entries.push({ collection: `remove.${name}`, index, id, target: `${kind}:${id || '?'+index}`, refs: [], raw, edits: [] });
        });
    }
    // All explicit mapping declarations are available when computing a same-call reframe.
    let draft = structuredClone(current);
    for (const entry of entries.filter(e => e.collection === 'maps')) {
        try { entry.edits = prepareEntry(draft, entry, player); draft = stageMapDomainEdits(draft, entry.edits); }
        catch (error) { entry.error = errorText(error); }
    }
    for (const entry of entries.filter(e => e.collection !== 'maps' && !e.collection.startsWith('remove.'))) {
        try {
            entry.edits = prepareEntry(draft, entry, player);
            // Frame identities are generated locally. Their relation to other frames remains unknown.
            const owners: Array<string | null> = [];
            const raw = entry.raw as Record<string, unknown>;
            if (entry.collection === 'locations' && isRecord(raw.position)) { owners.push(mapOwner(raw.position.map) ?? null); }
            if (entry.collection === 'features' && Object.hasOwn(raw, 'map')) { owners.push(mapOwner(raw.map) ?? null); }
            for (const owner of owners) {
                const id = mapFrameId(owner);
                if (!current.atlas.frames.some(f => f.id === id) && !entries.some(e => e.collection === 'maps' && e.id === id)) { entry.edits.unshift({ op: 'upsert-frame', frame: { id, ...(owner ? { owner } : {}) } }); }
            }
            draft = stageMapDomainEdits(draft, entry.edits);
        } catch (error) { entry.error = errorText(error); }
    }
    const groups = atlasEditGroups(entries, current, draft);
    let working = current;
    const edits: MapDomainEdit[] = [], applied: MapToolItemReport[] = [], skipped: MapToolItemReport[] = [];
    for (const group of groups) {
        try {
            const failed = group.find(e => e.error);
            if (failed) { throw new Error(failed.error); }
            if (new Set(group.map(e => e.target)).size !== group.length) { throw new Error('atlas_duplicate_target'); }
            const groupEdits = group.flatMap(e => e.edits);
            const candidate = stageMapDomainEdits(working, groupEdits);
            groupEdits.push(...removals(candidate, group.filter(e => e.collection.startsWith('remove.'))));
            const next = applyIntentEdits(working, groupEdits);
            const changedKeys = new Set(group.filter(e => e.collection === 'locations').map(e => e.id));
            if (next.domain.atlas.locations.some(l => changedKeys.has(l.key) && l.sceneKey && !isMapSceneLocation(l))) { throw new Error('scene_location_required'); }
            if (unassignedMapLocations(next.domain.atlas).some(l => changedKeys.has(l.key) || locationRegion(working.atlas, l.key))) { throw new Error('location_region_required'); }
            for (const entry of group) { applied.push({ collection: entry.collection, index: entry.index, id: entry.id, changed: !jsonValuesEqual(targetValue(working, entry), targetValue(next.domain, entry)) }); }
            working = next.domain; edits.push(...groupEdits);
        } catch (error) {
            const reason = errorText(error);
            const hint = reason === 'location_region_required' ? MAP_REGION_REQUIRED_HINT : reason === 'scene_location_required' ? MAP_SCENE_LOCATION_REQUIRED_HINT : GROUP_HINT;
            for (const entry of group) { skipped.push({ collection: entry.collection, index: entry.index, id: entry.id, reason: entry.error || reason, hint }); }
        }
    }
    return { domain: working, edits, result: mapToolResult({ changed: !jsonValuesEqual(current, working), applied, skipped, data: { baseGaps: atlasBaseGaps(working.atlas) } }) };
}
