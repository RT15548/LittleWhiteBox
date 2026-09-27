import { sha256 } from 'js-sha256';
import type { AcceptedTurnPlayer } from '../../../capabilities/maintenance/accepted-turn-source.js';
import type { MapDomainEdit } from '../../../domains/map/edit.js';
import { compileAtlasLocations } from './atlas-location-compiler.js';
import {
    MAX_MAP_ACTORS,
    MAX_MAP_LABEL_LENGTH,
    MAX_MAP_LINKS,
    MAX_MAP_LOCATIONS,
} from '../../../domains/map/invariants.js';
import type {
    MapActorPosition,
    MapDomainV1,
    MapLink,
    MapLinkKind,
} from '../../../domains/map/types.js';
import { mapToolResult, type MapToolResult } from './result.js';
import { applyIntentEdits, enumToken, errorText, intentId, intentText, isRecord } from './intent-common.js';

const LINK_KINDS: readonly MapLinkKind[] = ['door', 'stairs', 'elevator', 'path', 'road', 'portal', 'passage'];
const ROOT_FIELDS = new Set(['locations', 'links', 'actors', 'remove']);
const LINK_FIELDS = new Set(['id', 'from', 'to', 'kind', 'label', 'bidirectional']);
const ACTOR_FIELDS = new Set(['actorKey', 'displayName', 'locationKey']);
const REMOVAL_FIELDS = new Set(['locationKeys', 'linkIds', 'actorKeys']);

export interface AtlasIntentCompileResult {
    readonly domain: MapDomainV1;
    readonly edits: readonly MapDomainEdit[];
    readonly result: MapToolResult;
}

function stableLinkId(from: string, to: string, kind: string, bidirectional: boolean): string {
    const endpoints = bidirectional ? [from, to].sort() : [from, to];
    return `link:${sha256(JSON.stringify([bidirectional, ...endpoints, kind]))}`;
}

function unsupportedFields(value: Record<string, unknown>, allowed: ReadonlySet<string>): string[] {
    return Object.keys(value).filter(key => !allowed.has(key));
}

function actorRemovalEdits(domain: MapDomainV1, actorKey: string): MapDomainEdit[] {
    const edits: MapDomainEdit[] = [];
    for (const scene of Object.values(domain.scenes)) {
        for (const element of scene.elements) {
            if (element.category === 'actor' && element.actorKey === actorKey) {
                edits.push({ op: 'remove-element', sceneKey: scene.key, elementId: element.id });
            }
        }
    }
    edits.push({ op: 'remove-actor-position', actorKey });
    return edits;
}

function actorMoveEdits(domain: MapDomainV1, position: MapActorPosition): MapDomainEdit[] {
    const ownerByScene = new Map(domain.atlas.locations
        .filter(location => location.sceneKey)
        .map(location => [location.sceneKey as string, location.key]));
    return [
        ...Object.values(domain.scenes).flatMap(scene => scene.elements
            .filter(element => (
                element.category === 'actor'
                && element.actorKey === position.actorKey
                && ownerByScene.get(scene.key) !== position.locationKey
            ))
            .map(element => ({ op: 'remove-element' as const, sceneKey: scene.key, elementId: element.id }))),
        { op: 'set-actor-position', position },
    ];
}

function descendantLocationKeys(domain: MapDomainV1, rootKey: string): Set<string> {
    const result = new Set([rootKey]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const location of domain.atlas.locations) {
            if (location.parent && result.has(location.parent) && !result.has(location.key)) {
                result.add(location.key);
                changed = true;
            }
        }
    }
    return result;
}

function locationRemovalEdits(domain: MapDomainV1, locationKey: string): MapDomainEdit[] {
    const keys = descendantLocationKeys(domain, locationKey);
    const edits: MapDomainEdit[] = [];
    for (const link of domain.atlas.links) {
        if (keys.has(link.from) || keys.has(link.to)) {edits.push({ op: 'remove-link', linkId: link.id });}
    }
    for (const actor of domain.atlas.actors) {
        if (keys.has(actor.locationKey)) {edits.push(...actorRemovalEdits(domain, actor.actorKey));}
    }
    for (const location of domain.atlas.locations) {
        if (!keys.has(location.key)) {continue;}
        if (location.sceneKey) {edits.push({ op: 'remove-scene', sceneKey: location.sceneKey });}
    }
    [...keys].reverse().forEach(key => edits.push({ op: 'remove-location', locationKey: key }));
    return edits;
}

export function compileAtlasIntent(
    current: MapDomainV1,
    value: unknown,
    player: AcceptedTurnPlayer,
): AtlasIntentCompileResult {
    if (!isRecord(value)) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: '', reason: 'arguments_must_be_object' }] }) };
    }
    const rootUnknown = unsupportedFields(value, ROOT_FIELDS);
    if (rootUnknown.length) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{ index: 0, id: '', reason: 'atlas_has_unsupported_fields', hint: `Remove unsupported fields: ${rootUnknown.join(', ')}.` }],
            }),
        };
    }
    if (value.remove !== undefined && !isRecord(value.remove)) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({ skipped: [{ index: 0, id: '', reason: 'atlas_remove_must_be_object' }] }),
        };
    }
    const removals = isRecord(value.remove) ? value.remove : {};
    const removalUnknown = unsupportedFields(removals, REMOVAL_FIELDS);
    if (removalUnknown.length) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{ index: 0, id: '', reason: 'atlas_remove_has_unsupported_fields', hint: `Remove unsupported fields: ${removalUnknown.join(', ')}.` }],
            }),
        };
    }
    const wrongCollection = [
        ['locations', value.locations],
        ['links', value.links],
        ['actors', value.actors],
        ['remove.locationKeys', removals.locationKeys],
        ['remove.linkIds', removals.linkIds],
        ['remove.actorKeys', removals.actorKeys],
    ].find(entry => entry[1] !== undefined && !Array.isArray(entry[1]));
    if (wrongCollection) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{
                    index: 0,
                    id: '',
                    reason: 'atlas_collection_must_be_array',
                    hint: `${String(wrongCollection[0])} must be an array.`,
                }],
            }),
        };
    }
    const oversized = [
        ['locations', value.locations, MAX_MAP_LOCATIONS],
        ['links', value.links, MAX_MAP_LINKS],
        ['actors', value.actors, MAX_MAP_ACTORS],
        ['remove.locationKeys', removals.locationKeys, MAX_MAP_LOCATIONS],
        ['remove.linkIds', removals.linkIds, MAX_MAP_LINKS],
        ['remove.actorKeys', removals.actorKeys, MAX_MAP_ACTORS],
    ].find((entry) => Array.isArray(entry[1]) && entry[1].length > Number(entry[2]));
    if (oversized) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{
                    index: 0,
                    id: '',
                    reason: 'atlas_collection_exceeds_limit',
                    hint: `Send at most ${Number(oversized[2])} ${String(oversized[0])} entries in one MapAtlasEdit call.`,
                }],
            }),
        };
    }
    const rawLocations = Array.isArray(value.locations) ? value.locations : [];
    const locations = compileAtlasLocations(current, rawLocations);
    let working = locations.domain;
    const edits = [...locations.edits];
    const applied = [...locations.applied];
    const skipped = [...locations.skipped];
    const warnings: string[] = [];
    let changed = locations.changed;

    const applyItem = (collection: string, index: number, id: string, itemEdits: MapDomainEdit[], hint: string): boolean => {
        try {
            const next = applyIntentEdits(working, itemEdits);
            working = next.domain;
            changed ||= next.changed;
            edits.push(...itemEdits);
            applied.push({ collection, index, id, changed: next.changed });
            return true;
        } catch (error) {
            skipped.push({ collection, index, id, reason: errorText(error), hint });
            return false;
        }
    };

    const rawLinks = Array.isArray(value.links) ? value.links : [];
    rawLinks.forEach((raw, index) => {
        if (!isRecord(raw)) {
            skipped.push({ collection: 'links', index, id: '', reason: 'link_must_be_object' });
            return;
        }
        const unknown = unsupportedFields(raw, LINK_FIELDS);
        if (unknown.length) {
            skipped.push({ collection: 'links', index, id: intentId(raw.id), reason: 'link_has_unsupported_fields', hint: `Remove unsupported fields: ${unknown.join(', ')}.` });
            return;
        }
        const from = intentId(raw.from);
        const to = intentId(raw.to);
        const kind = enumToken(raw.kind, LINK_KINDS);
        const bidirectional = raw.bidirectional !== false;
        const id = intentId(raw.id, from && to && kind ? stableLinkId(from, to, kind, bidirectional) : '');
        if (!from || !to || !kind || !id) {
            skipped.push({ collection: 'links', index, id, reason: 'link_requires_from_to_kind', hint: 'Use existing location keys and a supported route kind.' });
            return;
        }
        const [canonicalFrom, canonicalTo] = bidirectional ? [from, to].sort() : [from, to];
        const link: MapLink = { id, from: canonicalFrom, to: canonicalTo, kind, bidirectional };
        const label = intentText(raw.label, '', MAX_MAP_LABEL_LENGTH);
        if (label) {link.label = label;}
        applyItem('links', index, id, [{ op: 'upsert-link', link }], 'Create both endpoint locations before this link.');
    });

    const rawActors = Array.isArray(value.actors) ? value.actors : [];
    rawActors.forEach((raw, index) => {
        if (!isRecord(raw)) {
            skipped.push({ collection: 'actors', index, id: '', reason: 'actor_must_be_object' });
            return;
        }
        const unknown = unsupportedFields(raw, ACTOR_FIELDS);
        if (unknown.length) {
            skipped.push({ collection: 'actors', index, id: intentId(raw.actorKey), reason: 'actor_has_unsupported_fields', hint: `Remove unsupported fields: ${unknown.join(', ')}.` });
            return;
        }
        const requested = intentId(raw.actorKey);
        const actorKey = requested === 'user' ? 'player' : requested;
        const locationKey = intentId(raw.locationKey);
        if (!actorKey || !locationKey) {
            skipped.push({ collection: 'actors', index, id: actorKey, reason: 'actor_requires_actorKey_and_locationKey' });
            return;
        }
        const displayName = actorKey === 'player'
            ? player.displayName
            : intentText(
                raw.displayName,
                working.atlas.actors.find(actor => actor.actorKey === actorKey)?.displayName || actorKey,
            );
        applyItem('actors', index, actorKey, actorMoveEdits(working, { actorKey, displayName, locationKey }), 'Use an existing location key.');
    });

    const linkIds = Array.isArray(removals.linkIds) ? removals.linkIds : [];
    linkIds.forEach((raw, index) => {
        const id = intentId(raw);
        if (!id) {skipped.push({ collection: 'remove.linkIds', index, id: '', reason: 'link_id_required' }); return;}
        applyItem('remove.linkIds', index, id, [{ op: 'remove-link', linkId: id }], 'Use a valid link id.');
    });
    const actorKeys = Array.isArray(removals.actorKeys) ? removals.actorKeys : [];
    actorKeys.forEach((raw, index) => {
        const requested = intentId(raw);
        const actorKey = requested === 'user' ? 'player' : requested;
        if (!actorKey) {skipped.push({ collection: 'remove.actorKeys', index, id: '', reason: 'actor_key_required' }); return;}
        applyItem('remove.actorKeys', index, actorKey, actorRemovalEdits(working, actorKey), 'Use a valid actor key.');
    });
    const locationKeys = Array.isArray(removals.locationKeys) ? removals.locationKeys : [];
    locationKeys.forEach((raw, index) => {
        const key = intentId(raw);
        if (!key) {skipped.push({ collection: 'remove.locationKeys', index, id: '', reason: 'location_key_required' }); return;}
        applyItem('remove.locationKeys', index, key, locationRemovalEdits(working, key), 'Use an existing location key.');
    });

    if (!rawLocations.length && !rawLinks.length && !rawActors.length && !Object.keys(removals).length) {
        warnings.push('No atlas declarations were supplied.');
    }
    return { domain: working, edits, result: mapToolResult({ changed, applied, skipped, warnings }) };
}
