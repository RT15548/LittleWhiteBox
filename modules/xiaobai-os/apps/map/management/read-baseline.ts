import type { MapDomainV1 } from '../../../domains/map/types.js';
import type { MapDomainEdit } from '../../../domains/map/edit.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';

type Kind = 'location' | 'link' | 'actor' | 'scene';
type Reference = { kind: Kind; key: string };
function value(domain: MapDomainV1, { kind, key }: Reference): unknown {
    if (kind === 'scene') { return domain.scenes[key] ?? null; }
    if (kind === 'location') { return domain.atlas.locations.find(item => item.key === key) ?? null; }
    if (kind === 'link') { return domain.atlas.links.find(item => item.id === key) ?? null; }
    return domain.atlas.actors.find(item => item.actorKey === key) ?? null;
}
function target(edit: MapDomainEdit): Reference {
    switch (edit.op) {
        case 'upsert-location': return { kind: 'location', key: edit.location.key };
        case 'remove-location': return { kind: 'location', key: edit.locationKey };
        case 'upsert-link': return { kind: 'link', key: edit.link.id };
        case 'remove-link': return { kind: 'link', key: edit.linkId };
        case 'set-actor-position': return { kind: 'actor', key: edit.position.actorKey };
        case 'remove-actor-position': return { kind: 'actor', key: edit.actorKey };
        case 'initialize-scene': return { kind: 'scene', key: edit.scene.key };
        default: return { kind: 'scene', key: edit.sceneKey };
    }
}

/** Reading one object advances only that object's evidence, never the whole atlas. */
export function createMapReadBaseline(initial: MapDomainV1) {
    const read = new Map<string, unknown>();
    const id = (ref: Reference) => JSON.stringify([ref.kind, ref.key]);
    const observe = (domain: MapDomainV1, ref: Reference) => read.set(id(ref), value(domain, ref));
    function check(domain: MapDomainV1, ref: Reference) {
        const before = read.has(id(ref)) ? read.get(id(ref)) : value(initial, ref);
        if (!jsonValuesEqual(before, value(domain, ref))) { throw new Error('management_request_superseded'); }
    }
    return {
        atlas(domain: MapDomainV1, data: Record<string, unknown>) {
            const collections = [['locations', 'location', 'key'], ['links', 'link', 'id'], ['actors', 'actor', 'actorKey']] as const;
            for (const [collection, kind, key] of collections) {
                for (const item of (data[collection] ?? []) as Record<string, string>[]) { observe(domain, { kind, key: item[key] }); }
            }
            if (data.mode === 'summary') { observe(domain, { kind: 'actor', key: 'player' }); }
        },
        scene(domain: MapDomainV1, key: string, offset: number) {
            const ref = { kind: 'scene' as const, key };
            if (offset > 0) { check(domain, ref); }
            observe(domain, ref);
            const owner = domain.atlas.locations.find(item => item.sceneKey === key);
            if (owner) {
                const location = { kind: 'location' as const, key: owner.key };
                if (offset > 0) { check(domain, location); }
                observe(domain, location);
            }
        },
        assertEdits(domain: MapDomainV1, edits: readonly MapDomainEdit[]) {
            const locations = new Set<string>();
            for (const edit of edits) {
                const ref = target(edit); check(domain, ref);
                if (ref.kind === 'location') { locations.add(ref.key); }
                if (ref.kind === 'scene') {
                    const owner = domain.atlas.locations.find(item => item.sceneKey === ref.key);
                    if (owner) { locations.add(owner.key); }
                }
                if (edit.op === 'upsert-location' && edit.location.parent) { locations.add(edit.location.parent); }
                if (edit.op === 'upsert-link') { locations.add(edit.link.from); locations.add(edit.link.to); }
                if (edit.op === 'set-actor-position') { locations.add(edit.position.locationKey); }
            }
            // Parent chains and scene owners participate in spatial meaning, not just the target's revision.
            for (const key of locations) {
                check(domain, { kind: 'location', key });
                const parent = domain.atlas.locations.find(item => item.key === key)?.parent;
                if (parent) { locations.add(parent); }
            }
        },
        saved(domain: MapDomainV1, edits: readonly MapDomainEdit[]) {
            for (const edit of edits) { observe(domain, target(edit)); }
        },
    };
}
