import { MapDomainError, parseMapDomain } from './invariants.js';
import type {
    MapActorPosition,
    MapDomainV1,
    MapElement,
    MapLink,
    MapLocation,
    MapScene,
    MapSceneMood,
} from './types.js';

export type MapLocationEdit =
    | { op: 'upsert-location'; location: MapLocation }
    | { op: 'remove-location'; locationKey: string };

export type MapLinkEdit =
    | { op: 'upsert-link'; link: MapLink }
    | { op: 'remove-link'; linkId: string };

export type MapActorEdit =
    | { op: 'set-actor-position'; position: MapActorPosition }
    | { op: 'remove-actor-position'; actorKey: string };

export type MapSceneEdit =
    | { op: 'initialize-scene'; scene: Omit<MapScene, 'elements'> }
    | {
        op: 'update-scene';
        sceneKey: string;
        changes: Partial<Pick<MapScene, 'name' | 'status' | 'viewBox'>> & { mood?: MapSceneMood | null };
    }
    | { op: 'remove-scene'; sceneKey: string }
    | { op: 'upsert-element'; sceneKey: string; element: MapElement }
    | { op: 'remove-element'; sceneKey: string; elementId: string };

/** Internal canonical commands emitted by Map intent compilers; never exposed as Agent tools. */
export type MapDomainEdit = MapLocationEdit | MapLinkEdit | MapActorEdit | MapSceneEdit;

function replaceByKey<T>(items: T[], value: T, keyOf: (item: T) => string): void {
    const index = items.findIndex(item => keyOf(item) === keyOf(value));
    if (index === -1) {items.push(structuredClone(value));}
    else {items[index] = structuredClone(value);}
}

function applyEdit(candidate: MapDomainV1, edit: MapDomainEdit): void {
    switch (edit.op) {
        case 'upsert-location': {
            const location = structuredClone(edit.location);
            if (candidate.atlas.actors.some(actor => actor.actorKey === 'player' && actor.locationKey === location.key)) {
                location.status = 'visited';
            }
            replaceByKey(candidate.atlas.locations, location, item => item.key);
            return;
        }
        case 'remove-location':
            candidate.atlas.locations = candidate.atlas.locations.filter(location => location.key !== edit.locationKey);
            return;
        case 'upsert-link':
            replaceByKey(candidate.atlas.links, edit.link, link => link.id);
            return;
        case 'remove-link':
            candidate.atlas.links = candidate.atlas.links.filter(link => link.id !== edit.linkId);
            return;
        case 'set-actor-position': {
            replaceByKey(candidate.atlas.actors, edit.position, actor => actor.actorKey);
            if (edit.position.actorKey === 'player') {
                const location = candidate.atlas.locations.find(item => item.key === edit.position.locationKey);
                if (location) {location.status = 'visited';}
            }
            return;
        }
        case 'remove-actor-position':
            candidate.atlas.actors = candidate.atlas.actors.filter(actor => actor.actorKey !== edit.actorKey);
            return;
        case 'initialize-scene':
            if (Object.hasOwn(candidate.scenes, edit.scene.key)) {
                throw new MapDomainError('map_invalid_edit', `scene already exists: ${edit.scene.key}`);
            }
            candidate.scenes[edit.scene.key] = { ...structuredClone(edit.scene), elements: [] };
            return;
        case 'update-scene': {
            const scene = candidate.scenes[edit.sceneKey];
            if (!scene) {throw new MapDomainError('map_invalid_edit', `scene does not exist: ${edit.sceneKey}`);}
            if (edit.changes.name !== undefined) {scene.name = edit.changes.name;}
            if (edit.changes.status !== undefined) {scene.status = edit.changes.status;}
            if (edit.changes.viewBox !== undefined) {scene.viewBox = structuredClone(edit.changes.viewBox);}
            if (Object.hasOwn(edit.changes, 'mood')) {
                if (edit.changes.mood === null) {delete scene.mood;}
                else if (edit.changes.mood !== undefined) {scene.mood = edit.changes.mood;}
            }
            return;
        }
        case 'remove-scene':
            delete candidate.scenes[edit.sceneKey];
            return;
        case 'upsert-element': {
            const scene = candidate.scenes[edit.sceneKey];
            if (!scene) {throw new MapDomainError('map_invalid_edit', `scene does not exist: ${edit.sceneKey}`);}
            replaceByKey(scene.elements, edit.element, element => element.id);
            return;
        }
        case 'remove-element': {
            const scene = candidate.scenes[edit.sceneKey];
            if (scene) {scene.elements = scene.elements.filter(element => element.id !== edit.elementId);}
            return;
        }
    }
}

/** Applies canonical internal commands atomically and advances one observable domain revision. */
export function applyMapDomainEdits(current: MapDomainV1, edits: readonly MapDomainEdit[]): MapDomainV1 {
    const original = parseMapDomain(current);
    // Tools bound their declarations and the domain bounds saved data. One valid
    // cascade can expand to many more internal removals than the input count.
    if (!Array.isArray(edits)) {
        throw new MapDomainError('map_invalid_edit', 'edits must be an array');
    }
    const before = JSON.stringify({ atlas: original.atlas, scenes: original.scenes });
    const candidate = structuredClone(original);
    edits.forEach(edit => applyEdit(candidate, edit));
    const validated = parseMapDomain(candidate);
    if (JSON.stringify({ atlas: validated.atlas, scenes: validated.scenes }) === before) {return validated;}
    if (validated.revision === Number.MAX_SAFE_INTEGER) {
        throw new MapDomainError('map_invalid_edit', 'revision cannot advance');
    }
    validated.revision += 1;
    return parseMapDomain(validated);
}
