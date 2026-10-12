import type { MapDomainV1, MapElementShape } from './types.js';
import { MAP_ARTIFICIAL_LIGHTS, MAP_CERTAINTIES, MAP_ELEMENT_CATEGORIES, MAP_ELEMENT_KINDS, MAP_ELEMENT_SHAPES, MAP_ICON_TOKENS, MAP_LIGHTING_SPACES, MAP_MATERIALS, MAP_NATURAL_LIGHTS } from './semantics.js';
import { MapValidation } from './validation.js';
export { MapDomainError, type MapDomainErrorCode } from './validation.js';

export const MAP_DOMAIN_SCHEMA_VERSION = 1 as const;
export const MAX_MAP_BYTES = 512 * 1024;
export const MAX_SCENE_ELEMENTS = 128;
export const MAX_MAP_LOCATIONS = 512;
export const MAX_MAP_LINKS = 1_024;
export const MAX_MAP_ACTORS = 256;
export const MAX_MAP_POINTS = 64;
export const MAX_MAP_ID_LENGTH = 80;
export const MAX_MAP_NAME_LENGTH = 120;
export const MAX_MAP_LABEL_LENGTH = 160;
export const MAX_MAP_BRIEF_LENGTH = 500;
export const MAX_MAP_COORDINATE = 100_000;
export const MAX_MAP_DIMENSION = 100_000;

const MAX_SCENES = 256;
const FORBIDDEN_RECORD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const LOCATION_SCALES = ['world', 'region', 'city', 'district', 'building', 'floor', 'room', 'outdoor'];
const LOCATION_TERRAINS = ['urban', 'plain', 'forest', 'water', 'mountain', 'desert', 'snow'];
const LOCATION_STATUSES = ['mentioned', 'visited'];
const LINK_KINDS = ['door', 'stairs', 'elevator', 'path', 'road', 'portal', 'passage'];
const SCENE_STATUSES = ['uninitialized', 'active'];
const SCENE_MOODS = ['neutral', 'warm', 'cold', 'dark', 'mystic', 'danger', 'calm'];

function text(v: MapValidation, value: unknown, path: string, maxLength: number): boolean {
    return v.check(typeof value === 'string' && value.length > 0 && value === value.trim()
        && Array.from(value).length <= maxLength && !/[\u0000-\u001f\u007f-\u009f]/u.test(value),
    'map_invalid_domain', path, `must be trimmed text of at most ${maxLength} characters`);
}

function id(v: MapValidation, value: unknown, path: string): void {
    if (text(v, value, path, MAX_MAP_ID_LENGTH)) {
        v.check(!FORBIDDEN_RECORD_KEYS.has(value as string), 'map_invalid_domain', path, 'uses a reserved key');
    }
}

function token(v: MapValidation, value: unknown, allowed: readonly string[], path: string): boolean {
    if (typeof value === 'string' && allowed.includes(value)) { return true; }
    return v.check(false, 'map_invalid_domain', path, `must be one of: ${allowed.join(', ')}`);
}

function coordinate(v: MapValidation, value: unknown, path: string): void {
    v.check(typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= MAX_MAP_COORDINATE,
        'map_invalid_domain', path, `must be a finite number between ${-MAX_MAP_COORDINATE} and ${MAX_MAP_COORDINATE}`);
}

function dimension(v: MapValidation, value: unknown, path: string): void {
    v.check(typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= MAX_MAP_DIMENSION,
        'map_invalid_domain', path, `must be a finite number greater than 0 and at most ${MAX_MAP_DIMENSION}`);
}

function pair(v: MapValidation, value: unknown, path: string): void {
    if (!v.check(Array.isArray(value) && value.length === 2, 'map_invalid_domain', path, 'must be an [x, y] pair')) {
        v.unchecked.add(path); return;
    }
    const coordinates = value as unknown[];
    coordinate(v, coordinates[0], `${path}.0`); coordinate(v, coordinates[1], `${path}.1`);
}

function geometry(v: MapValidation, value: unknown, shape: MapElementShape, path: string): void {
    const fields = shape === 'rect' ? ['x', 'y', 'width', 'height'] : shape === 'circle' ? ['x', 'y', 'radius']
        : shape === 'path' || shape === 'curve' ? ['points'] : ['x', 'y'];
    const record = v.record(value, path, fields);
    if (!record) { return; }
    if (fields.includes('points')) {
        const points = v.array(record.points, `${path}.points`, MAX_MAP_POINTS, 'map_invalid_domain');
        if (points) {
            v.check(points.length >= 2, 'map_invalid_domain', `${path}.points`, `must contain 2 to ${MAX_MAP_POINTS} points`);
            points.forEach((entry, index) => pair(v, entry, `${path}.points.${index}`));
        }
    } else {
        coordinate(v, record.x, `${path}.x`); coordinate(v, record.y, `${path}.y`);
        for (const key of fields.filter(key => key !== 'x' && key !== 'y')) { dimension(v, record[key], `${path}.${key}`); }
    }
}

function element(v: MapValidation, value: unknown, path: string): void {
    const record = v.record(value, path, ['id', 'category', 'shape', 'geometry'],
        ['kind', 'icon', 'label', 'actorKey', 'material', 'certainty', 'closed', 'rotation']);
    if (!record) { return; }
    id(v, record.id, `${path}.id`);
    const categoryValid = token(v, record.category, MAP_ELEMENT_CATEGORIES, `${path}.category`);
    const shapeValid = token(v, record.shape, MAP_ELEMENT_SHAPES, `${path}.shape`);
    if (categoryValid) {
        v.check((record.category === 'actor') === Object.hasOwn(record, 'actorKey'), 'map_invalid_domain',
            `${path}.actorKey`, 'actor elements alone must declare actorKey');
    }
    if (shapeValid) { geometry(v, record.geometry, record.shape as MapElementShape, `${path}.geometry`); }
    else { v.unchecked.add(`${path}.geometry`); }
    if (Object.hasOwn(record, 'kind')) { token(v, record.kind, MAP_ELEMENT_KINDS, `${path}.kind`); }
    if (Object.hasOwn(record, 'icon')) { token(v, record.icon, MAP_ICON_TOKENS, `${path}.icon`); }
    if (Object.hasOwn(record, 'label')) { text(v, record.label, `${path}.label`, MAX_MAP_LABEL_LENGTH); }
    if (Object.hasOwn(record, 'actorKey')) { id(v, record.actorKey, `${path}.actorKey`); }
    if (Object.hasOwn(record, 'material')) { token(v, record.material, MAP_MATERIALS, `${path}.material`); }
    if (Object.hasOwn(record, 'certainty')) { token(v, record.certainty, MAP_CERTAINTIES, `${path}.certainty`); }
    if (Object.hasOwn(record, 'closed')) { v.check(typeof record.closed === 'boolean', 'map_invalid_domain', `${path}.closed`, 'must be boolean'); }
    if (Object.hasOwn(record, 'rotation')) {
        v.check((record.shape === 'rect' || record.shape === 'circle') && typeof record.rotation === 'number'
            && Number.isFinite(record.rotation) && record.rotation >= 0 && record.rotation < 360,
        'map_invalid_domain', `${path}.rotation`, 'requires rect/circle and a finite angle in [0, 360)');
    }
}

function unique(v: MapValidation, values: readonly unknown[], key: string, path: string): void {
    const seen = new Set<string>();
    values.forEach((value, index) => {
        if (!value || typeof value !== 'object') { return; }
        const identity = (value as Record<string, unknown>)[key];
        if (typeof identity !== 'string') { return; }
        v.check(!seen.has(identity), 'map_invalid_domain', `${path}.${index}.${key}`, 'must be unique in its collection');
        seen.add(identity);
    });
}

function scene(v: MapValidation, value: unknown, recordKey: string, path: string): void {
    const record = v.record(value, path, ['key', 'name', 'status', 'viewBox', 'elements'], ['mood', 'lighting']);
    if (!record) { return; }
    id(v, record.key, `${path}.key`);
    v.check(record.key === recordKey, 'map_invalid_domain', `${path}.key`, 'must match its record key');
    text(v, record.name, `${path}.name`, MAX_MAP_NAME_LENGTH);
    token(v, record.status, SCENE_STATUSES, `${path}.status`);
    if (Object.hasOwn(record, 'mood')) { token(v, record.mood, SCENE_MOODS, `${path}.mood`); }
    if (Object.hasOwn(record, 'lighting')) {
        const lighting = v.record(record.lighting, `${path}.lighting`, ['space', 'natural', 'artificial']);
        if (lighting) {
            token(v, lighting.space, MAP_LIGHTING_SPACES, `${path}.lighting.space`);
            token(v, lighting.natural, MAP_NATURAL_LIGHTS, `${path}.lighting.natural`);
            token(v, lighting.artificial, MAP_ARTIFICIAL_LIGHTS, `${path}.lighting.artificial`);
        }
    }
    if (v.check(Array.isArray(record.viewBox) && record.viewBox.length === 4, 'map_invalid_domain', `${path}.viewBox`, 'must be [x, y, width, height]')) {
        const box = record.viewBox as unknown[];
        coordinate(v, box[0], `${path}.viewBox.0`); coordinate(v, box[1], `${path}.viewBox.1`);
        dimension(v, box[2], `${path}.viewBox.2`); dimension(v, box[3], `${path}.viewBox.3`);
    } else { v.unchecked.add(`${path}.viewBox`); }
    const elements = v.array(record.elements, `${path}.elements`, MAX_SCENE_ELEMENTS);
    if (elements) {
        elements.forEach((entry, index) => element(v, entry, `${path}.elements.${index}`));
        unique(v, elements, 'id', `${path}.elements`);
    }
}

function location(v: MapValidation, value: unknown, path: string): void {
    const record = v.record(value, path, ['key', 'name', 'scale', 'status'], ['parent', 'sceneKey', 'brief', 'position', 'terrain']);
    if (!record) { return; }
    id(v, record.key, `${path}.key`);
    text(v, record.name, `${path}.name`, MAX_MAP_NAME_LENGTH);
    token(v, record.scale, LOCATION_SCALES, `${path}.scale`);
    token(v, record.status, LOCATION_STATUSES, `${path}.status`);
    if (Object.hasOwn(record, 'parent')) { id(v, record.parent, `${path}.parent`); }
    if (Object.hasOwn(record, 'sceneKey')) { id(v, record.sceneKey, `${path}.sceneKey`); }
    if (Object.hasOwn(record, 'brief')) { text(v, record.brief, `${path}.brief`, MAX_MAP_BRIEF_LENGTH); }
    if (Object.hasOwn(record, 'position')) { pair(v, record.position, `${path}.position`); }
    if (Object.hasOwn(record, 'terrain')) { token(v, record.terrain, LOCATION_TERRAINS, `${path}.terrain`); }
}

function link(v: MapValidation, value: unknown, path: string): void {
    const record = v.record(value, path, ['id', 'from', 'to', 'kind', 'bidirectional'], ['label']);
    if (!record) { return; }
    for (const key of ['id', 'from', 'to']) { id(v, record[key], `${path}.${key}`); }
    token(v, record.kind, LINK_KINDS, `${path}.kind`);
    v.check(typeof record.bidirectional === 'boolean', 'map_invalid_domain', `${path}.bidirectional`, 'must be boolean');
    if (Object.hasOwn(record, 'label')) { text(v, record.label, `${path}.label`, MAX_MAP_LABEL_LENGTH); }
}

function actor(v: MapValidation, value: unknown, path: string): void {
    const record = v.record(value, path, ['actorKey', 'displayName', 'locationKey']);
    if (!record) { return; }
    id(v, record.actorKey, `${path}.actorKey`); id(v, record.locationKey, `${path}.locationKey`);
    text(v, record.displayName, `${path}.displayName`, MAX_MAP_NAME_LENGTH);
}

function references(v: MapValidation, domain: MapDomainV1, path: string): void {
    const { locations, links, actors } = domain.atlas;
    const { scenes } = domain;
    const byKey = new Map(locations.map(entry => [entry.key, entry]));
    const sceneOwners = new Set<string>();
    locations.forEach((entry, index) => {
        const here = `${path}.atlas.locations.${index}`;
        if (entry.parent) { v.check(byKey.has(entry.parent), 'map_invalid_domain', `${here}.parent`, `has missing parent ${entry.parent}`); }
        if (entry.sceneKey) {
            v.check(Object.hasOwn(scenes, entry.sceneKey), 'map_invalid_domain', `${here}.sceneKey`, `has missing scene ${entry.sceneKey}`);
            v.check(!sceneOwners.has(entry.sceneKey), 'map_invalid_domain', `${here}.sceneKey`, `shares scene ${entry.sceneKey}`);
            sceneOwners.add(entry.sceneKey);
        }
        const ancestors = new Set([entry.key]);
        let cursor: typeof entry | undefined = entry;
        while (cursor?.parent) {
            if (!v.check(!ancestors.has(cursor.parent), 'map_invalid_domain', `${here}.parent`, `contains a parent cycle at ${cursor.parent}`)) { break; }
            ancestors.add(cursor.parent);
            cursor = byKey.get(cursor.parent);
        }
    });
    for (const sceneKey of Object.keys(scenes)) {
        v.check(sceneOwners.has(sceneKey), 'map_invalid_domain', `${path}.scenes.${sceneKey}`, 'is not owned by a location');
    }
    links.forEach((entry, index) => {
        for (const key of ['from', 'to'] as const) {
            v.check(byKey.has(entry[key]), 'map_invalid_domain', `${path}.atlas.links.${index}.${key}`, `has missing endpoint ${entry[key]}`);
        }
        v.check(entry.from !== entry.to, 'map_invalid_domain', `${path}.atlas.links.${index}`, `has a self-link ${entry.id}`);
    });
    const actorByKey = new Map(actors.map(entry => [entry.actorKey, entry]));
    actors.forEach((entry, index) => {
        v.check(byKey.has(entry.locationKey), 'map_invalid_domain', `${path}.atlas.actors.${index}.locationKey`, `has missing location ${entry.locationKey}`);
    });
    const rendered = new Set<string>();
    for (const entry of Object.values(scenes)) {
        entry.elements.forEach((item, index) => {
            if (item.category !== 'actor') { return; }
            const here = `${path}.scenes.${entry.key}.elements.${index}.actorKey`;
            const position = actorByKey.get(item.actorKey!);
            if (!v.check(!!position, 'map_invalid_domain', here, `has unknown actor ${item.actorKey}`)) { return; }
            const owner = byKey.get(position!.locationKey);
            if (owner) { v.check(owner.sceneKey === entry.key, 'map_invalid_domain', here, `renders actor ${item.actorKey} at the wrong location`); }
            v.check(!rendered.has(item.actorKey!), 'map_invalid_domain', here, `renders actor ${item.actorKey} more than once`);
            rendered.add(item.actorKey!);
        });
    }
}

export function isMapRevision(value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/** Reads and writes use the same inspection. Independent fields are checked together. */
export function validateMapDomain(value: unknown, path = 'domains.map'): asserts value is MapDomainV1 {
    const v = new MapValidation();
    const root = v.record(value, path, ['schemaVersion', 'revision', 'atlas', 'scenes']);
    if (!root) { v.finish(); return; }
    v.check(root.schemaVersion === MAP_DOMAIN_SCHEMA_VERSION, 'map_unsupported_version', `${path}.schemaVersion`, `must be ${MAP_DOMAIN_SCHEMA_VERSION}`);
    v.check(isMapRevision(root.revision), 'map_invalid_domain', `${path}.revision`, 'must be a non-negative safe integer');
    const atlas = v.record(root.atlas, `${path}.atlas`, ['locations', 'links', 'actors']);
    if (atlas) {
        const collections = [
            ['locations', MAX_MAP_LOCATIONS, location, 'key'],
            ['links', MAX_MAP_LINKS, link, 'id'],
            ['actors', MAX_MAP_ACTORS, actor, 'actorKey'],
        ] as const;
        for (const [key, maximum, inspect, identity] of collections) {
            const items = v.array(atlas[key], `${path}.atlas.${key}`, maximum);
            if (items) {
                items.forEach((entry, index) => inspect(v, entry, `${path}.atlas.${key}.${index}`));
                unique(v, items, identity, `${path}.atlas.${key}`);
            }
        }
    }
    const scenes = root.scenes;
    if (v.check(!!scenes && typeof scenes === 'object' && !Array.isArray(scenes), 'map_invalid_domain', `${path}.scenes`, 'must be an object')) {
        const entries = Object.entries(scenes as Record<string, unknown>);
        if (v.check(entries.length <= MAX_SCENES, 'map_collection_limit', `${path}.scenes`, `exceeds ${MAX_SCENES}`)) {
            for (const [key, entry] of entries) {
                id(v, key, `${path}.scenes.${key}`);
                scene(v, entry, key, `${path}.scenes.${key}`);
            }
        } else { v.unchecked.add(`${path}.scenes`); }
    } else { v.unchecked.add(`${path}.scenes`); }
    if (!v.issues.length) { references(v, value as MapDomainV1, path); }
    else { v.unchecked.add('references'); }
    let bytes: number | undefined;
    try { bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength; }
    catch { v.check(false, 'map_invalid_domain', path, 'must be JSON serializable'); }
    if (bytes !== undefined) { v.check(bytes <= MAX_MAP_BYTES, 'map_size_limit', path, `exceeds ${MAX_MAP_BYTES} UTF-8 bytes`); }
    v.finish();
}

export function parseMapDomain(value: unknown, path = 'domains.map'): MapDomainV1 {
    validateMapDomain(value, path);
    return structuredClone(value);
}
