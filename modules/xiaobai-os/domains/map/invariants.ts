import type {
    CircleGeometry,
    MapActorPosition,
    MapDomainV1,
    MapElement,
    MapElementCategory,
    MapElementKind,
    MapElementShape,
    MapIconToken,
    MapLink,
    MapLinkKind,
    MapLocation,
    MapLocationScale,
    MapLocationStatus,
    MapMaterial,
    MapScene,
    MapSceneMood,
    MapSceneStatus,
    MapTerrain,
    PointGeometry,
    PointsGeometry,
    RectGeometry,
} from './types.js';
import {
    MAP_CERTAINTIES,
    MAP_ELEMENT_CATEGORIES,
    MAP_ELEMENT_KINDS,
    MAP_ELEMENT_SHAPES,
    MAP_ICON_TOKENS,
    MAP_MATERIALS,
} from './semantics.js';

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

const LOCATION_SCALES = new Set<MapLocationScale>([
    'world', 'region', 'city', 'district', 'building', 'floor', 'room', 'outdoor',
]);
const LOCATION_TERRAINS = new Set<MapTerrain>(['urban', 'plain', 'forest', 'water', 'mountain', 'desert', 'snow']);
const LOCATION_STATUSES = new Set<MapLocationStatus>(['mentioned', 'visited']);
const LINK_KINDS = new Set<MapLinkKind>(['door', 'stairs', 'elevator', 'path', 'road', 'portal', 'passage']);
const SCENE_STATUSES = new Set<MapSceneStatus>(['uninitialized', 'active']);
const SCENE_MOODS = new Set<MapSceneMood>(['neutral', 'warm', 'cold', 'dark', 'mystic', 'danger', 'calm']);
const ELEMENT_CATEGORIES = new Set<MapElementCategory>(MAP_ELEMENT_CATEGORIES);
const ELEMENT_SHAPES = new Set<MapElementShape>(MAP_ELEMENT_SHAPES);
const ELEMENT_KINDS = new Set<MapElementKind>(MAP_ELEMENT_KINDS);
const ICON_TOKENS = new Set<MapIconToken>(MAP_ICON_TOKENS);
const MATERIALS = new Set<MapMaterial>(MAP_MATERIALS);
const CERTAINTIES = new Set<NonNullable<MapElement['certainty']>>(MAP_CERTAINTIES);

export type MapDomainErrorCode =
    | 'map_invalid_domain'
    | 'map_unsupported_version'
    | 'map_collection_limit'
    | 'map_size_limit'
    | 'map_invalid_edit';

export class MapDomainError extends Error {
    readonly code: MapDomainErrorCode;

    constructor(code: MapDomainErrorCode, detail = '') {
        super(detail ? `${code}: ${detail}` : code);
        this.name = 'MapDomainError';
        this.code = code;
    }
}

function fail(code: MapDomainErrorCode, path: string, detail: string): never {
    throw new MapDomainError(code, `${path} ${detail}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
    if (!isRecord(value)) {fail('map_invalid_domain', path, 'must be an object');}
    return value;
}

function requireKeys(
    value: Record<string, unknown>,
    required: readonly string[],
    optional: readonly string[],
    path: string,
): void {
    const allowed = new Set([...required, ...optional]);
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {fail('map_invalid_domain', `${path}.${key}`, 'is not allowed');}
    }
    for (const key of required) {
        if (!Object.hasOwn(value, key)) {fail('map_invalid_domain', `${path}.${key}`, 'is required');}
    }
}

function requireString(value: unknown, path: string, maxLength: number): string {
    if (
        typeof value !== 'string'
        || value.length === 0
        || value !== value.trim()
        || Array.from(value).length > maxLength
        || /[\u0000-\u001f\u007f-\u009f]/u.test(value)
    ) {
        fail('map_invalid_domain', path, `must be trimmed text of at most ${maxLength} characters`);
    }
    return value;
}

function requireId(value: unknown, path: string): string {
    const id = requireString(value, path, MAX_MAP_ID_LENGTH);
    if (FORBIDDEN_RECORD_KEYS.has(id)) {fail('map_invalid_domain', path, 'uses a reserved key');}
    return id;
}

function requireEnum<T extends string>(value: unknown, allowed: ReadonlySet<T>, path: string): T {
    if (typeof value !== 'string' || !allowed.has(value as T)) {
        fail('map_invalid_domain', path, 'has an unsupported token');
    }
    return value as T;
}

function requireCoordinate(value: unknown, path: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > MAX_MAP_COORDINATE) {
        fail('map_invalid_domain', path, 'must be a finite bounded coordinate');
    }
    return value;
}

function requireDimension(value: unknown, path: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > MAX_MAP_DIMENSION) {
        fail('map_invalid_domain', path, 'must be a positive bounded dimension');
    }
    return value;
}

function validateRectGeometry(value: unknown, path: string): RectGeometry {
    const record = requireRecord(value, path);
    requireKeys(record, ['x', 'y', 'width', 'height'], [], path);
    return {
        x: requireCoordinate(record.x, `${path}.x`),
        y: requireCoordinate(record.y, `${path}.y`),
        width: requireDimension(record.width, `${path}.width`),
        height: requireDimension(record.height, `${path}.height`),
    };
}

function validateCircleGeometry(value: unknown, path: string): CircleGeometry {
    const record = requireRecord(value, path);
    requireKeys(record, ['x', 'y', 'radius'], [], path);
    return {
        x: requireCoordinate(record.x, `${path}.x`),
        y: requireCoordinate(record.y, `${path}.y`),
        radius: requireDimension(record.radius, `${path}.radius`),
    };
}

function validatePointGeometry(value: unknown, path: string): PointGeometry {
    const record = requireRecord(value, path);
    requireKeys(record, ['x', 'y'], [], path);
    return {
        x: requireCoordinate(record.x, `${path}.x`),
        y: requireCoordinate(record.y, `${path}.y`),
    };
}

function validatePointsGeometry(value: unknown, path: string): PointsGeometry {
    const record = requireRecord(value, path);
    requireKeys(record, ['points'], [], path);
    const minimum = 2;
    if (!Array.isArray(record.points) || record.points.length < minimum || record.points.length > MAX_MAP_POINTS) {
        fail('map_invalid_domain', `${path}.points`, `must contain ${minimum} to ${MAX_MAP_POINTS} points`);
    }
    return {
        points: record.points.map((point, index) => {
            if (!Array.isArray(point) || point.length !== 2) {
                fail('map_invalid_domain', `${path}.points.${index}`, 'must be an [x, y] pair');
            }
            return [
                requireCoordinate(point[0], `${path}.points.${index}.0`),
                requireCoordinate(point[1], `${path}.points.${index}.1`),
            ];
        }),
    };
}

function validateElement(value: unknown, path: string): MapElement {
    const record = requireRecord(value, path);
    requireKeys(
        record,
        ['id', 'category', 'shape', 'geometry'],
        ['kind', 'icon', 'label', 'actorKey', 'material', 'certainty', 'closed', 'rotation'],
        path,
    );
    const category = requireEnum(record.category, ELEMENT_CATEGORIES, `${path}.category`);
    const shape = requireEnum(record.shape, ELEMENT_SHAPES, `${path}.shape`);
    if ((category === 'actor') !== Object.hasOwn(record, 'actorKey')) {
        fail('map_invalid_domain', path, 'actor elements alone must declare actorKey');
    }
    let geometry: MapElement['geometry'];
    if (shape === 'rect') {geometry = validateRectGeometry(record.geometry, `${path}.geometry`);}
    else if (shape === 'circle') {geometry = validateCircleGeometry(record.geometry, `${path}.geometry`);}
    else if (shape === 'path' || shape === 'curve') {
        geometry = validatePointsGeometry(record.geometry, `${path}.geometry`);
    } else {
        geometry = validatePointGeometry(record.geometry, `${path}.geometry`);
    }

    const element: MapElement = {
        id: requireId(record.id, `${path}.id`),
        category,
        shape,
        geometry,
    };
    if (Object.hasOwn(record, 'kind')) {
        element.kind = requireEnum(record.kind, ELEMENT_KINDS, `${path}.kind`);
    }
    if (Object.hasOwn(record, 'icon')) {
        element.icon = requireEnum(record.icon, ICON_TOKENS, `${path}.icon`);
    }
    if (Object.hasOwn(record, 'label')) {
        element.label = requireString(record.label, `${path}.label`, MAX_MAP_LABEL_LENGTH);
    }
    if (Object.hasOwn(record, 'actorKey')) {element.actorKey = requireId(record.actorKey, `${path}.actorKey`);}
    if (Object.hasOwn(record, 'material')) {
        element.material = requireEnum(record.material, MATERIALS, `${path}.material`);
    }
    if (Object.hasOwn(record, 'certainty')) {
        element.certainty = requireEnum(record.certainty, CERTAINTIES, `${path}.certainty`);
    }
    if (Object.hasOwn(record, 'closed')) {
        if (typeof record.closed !== 'boolean') {fail('map_invalid_domain', `${path}.closed`, 'must be boolean');}
        element.closed = record.closed;
    }
    if (Object.hasOwn(record, 'rotation')) {
        if ((shape !== 'rect' && shape !== 'circle') || typeof record.rotation !== 'number'
            || !Number.isFinite(record.rotation) || record.rotation < 0 || record.rotation >= 360) {
            fail('map_invalid_domain', `${path}.rotation`, 'requires rect/circle and a finite angle in [0, 360)');
        }
        element.rotation = record.rotation;
    }
    return element;
}

function validateScene(value: unknown, path: string): MapScene {
    const record = requireRecord(value, path);
    requireKeys(record, ['key', 'name', 'status', 'viewBox', 'elements'], ['mood'], path);
    if (!Array.isArray(record.viewBox) || record.viewBox.length !== 4) {
        fail('map_invalid_domain', `${path}.viewBox`, 'must be [x, y, width, height]');
    }
    if (!Array.isArray(record.elements)) {
        fail('map_invalid_domain', `${path}.elements`, 'must be an array');
    }
    if (record.elements.length > MAX_SCENE_ELEMENTS) {
        fail('map_collection_limit', `${path}.elements`, `exceeds ${MAX_SCENE_ELEMENTS}`);
    }
    const elementIds = new Set<string>();
    const elements = record.elements.map((entry, index) => {
        const element = validateElement(entry, `${path}.elements.${index}`);
        if (elementIds.has(element.id)) {
            fail('map_invalid_domain', `${path}.elements.${index}.id`, 'must be unique in its scene');
        }
        elementIds.add(element.id);
        return element;
    });
    const scene: MapScene = {
        key: requireId(record.key, `${path}.key`),
        name: requireString(record.name, `${path}.name`, MAX_MAP_NAME_LENGTH),
        status: requireEnum(record.status, SCENE_STATUSES, `${path}.status`),
        viewBox: [
            requireCoordinate(record.viewBox[0], `${path}.viewBox.0`),
            requireCoordinate(record.viewBox[1], `${path}.viewBox.1`),
            requireDimension(record.viewBox[2], `${path}.viewBox.2`),
            requireDimension(record.viewBox[3], `${path}.viewBox.3`),
        ],
        elements,
    };
    if (Object.hasOwn(record, 'mood')) {
        scene.mood = requireEnum(record.mood, SCENE_MOODS, `${path}.mood`);
    }
    return scene;
}

function validateLocation(value: unknown, path: string): MapLocation {
    const record = requireRecord(value, path);
    requireKeys(record, ['key', 'name', 'scale', 'status'], ['parent', 'sceneKey', 'brief', 'position', 'terrain'], path);
    const location: MapLocation = {
        key: requireId(record.key, `${path}.key`),
        name: requireString(record.name, `${path}.name`, MAX_MAP_NAME_LENGTH),
        scale: requireEnum(record.scale, LOCATION_SCALES, `${path}.scale`),
        status: requireEnum(record.status, LOCATION_STATUSES, `${path}.status`),
    };
    if (Object.hasOwn(record, 'parent')) {location.parent = requireId(record.parent, `${path}.parent`);}
    if (Object.hasOwn(record, 'sceneKey')) {location.sceneKey = requireId(record.sceneKey, `${path}.sceneKey`);}
    if (Object.hasOwn(record, 'brief')) {
        location.brief = requireString(record.brief, `${path}.brief`, MAX_MAP_BRIEF_LENGTH);
    }
    if (Object.hasOwn(record, 'position')) {
        if (!Array.isArray(record.position) || record.position.length !== 2) {
            fail('map_invalid_domain', `${path}.position`, 'must be an [x, y] pair');
        }
        location.position = [requireCoordinate(record.position[0], `${path}.position.0`), requireCoordinate(record.position[1], `${path}.position.1`)];
    }
    if (Object.hasOwn(record, 'terrain')) {
        location.terrain = requireEnum(record.terrain, LOCATION_TERRAINS, `${path}.terrain`);
    }
    return location;
}

function validateLink(value: unknown, path: string): MapLink {
    const record = requireRecord(value, path);
    requireKeys(record, ['id', 'from', 'to', 'kind', 'bidirectional'], ['label'], path);
    if (typeof record.bidirectional !== 'boolean') {
        fail('map_invalid_domain', `${path}.bidirectional`, 'must be boolean');
    }
    const link: MapLink = {
        id: requireId(record.id, `${path}.id`),
        from: requireId(record.from, `${path}.from`),
        to: requireId(record.to, `${path}.to`),
        kind: requireEnum(record.kind, LINK_KINDS, `${path}.kind`),
        bidirectional: record.bidirectional,
    };
    if (Object.hasOwn(record, 'label')) {
        link.label = requireString(record.label, `${path}.label`, MAX_MAP_LABEL_LENGTH);
    }
    return link;
}

function validateActor(value: unknown, path: string): MapActorPosition {
    const record = requireRecord(value, path);
    requireKeys(record, ['actorKey', 'displayName', 'locationKey'], [], path);
    return {
        actorKey: requireId(record.actorKey, `${path}.actorKey`),
        displayName: requireString(record.displayName, `${path}.displayName`, MAX_MAP_NAME_LENGTH),
        locationKey: requireId(record.locationKey, `${path}.locationKey`),
    };
}

function requireUnique<T>(items: readonly T[], keyOf: (item: T) => string, path: string): void {
    const seen = new Set<string>();
    for (const item of items) {
        const key = keyOf(item);
        if (seen.has(key)) {fail('map_invalid_domain', path, `contains duplicate key ${key}`);}
        seen.add(key);
    }
}

function validateReferences(
    locations: readonly MapLocation[],
    links: readonly MapLink[],
    actors: readonly MapActorPosition[],
    scenes: Readonly<Record<string, MapScene>>,
    path: string,
): void {
    const locationByKey = new Map(locations.map(location => [location.key, location]));
    const sceneOwners = new Map<string, string>();
    for (const location of locations) {
        if (location.parent && !locationByKey.has(location.parent)) {
            fail('map_invalid_domain', `${path}.atlas.locations`, `has missing parent ${location.parent}`);
        }
        if (location.sceneKey) {
            if (!Object.hasOwn(scenes, location.sceneKey)) {
                fail('map_invalid_domain', `${path}.atlas.locations`, `has missing scene ${location.sceneKey}`);
            }
            if (sceneOwners.has(location.sceneKey)) {
                fail('map_invalid_domain', `${path}.atlas.locations`, `shares scene ${location.sceneKey}`);
            }
            sceneOwners.set(location.sceneKey, location.key);
        }
    }
    for (const location of locations) {
        const ancestors = new Set<string>([location.key]);
        let cursor = location;
        while (cursor.parent) {
            if (ancestors.has(cursor.parent)) {
                fail('map_invalid_domain', `${path}.atlas.locations`, `contains a parent cycle at ${cursor.parent}`);
            }
            ancestors.add(cursor.parent);
            cursor = locationByKey.get(cursor.parent) as MapLocation;
        }
    }
    for (const sceneKey of Object.keys(scenes)) {
        if (!sceneOwners.has(sceneKey)) {
            fail('map_invalid_domain', `${path}.scenes.${sceneKey}`, 'is not owned by a location');
        }
    }
    for (const link of links) {
        if (!locationByKey.has(link.from) || !locationByKey.has(link.to)) {
            fail('map_invalid_domain', `${path}.atlas.links`, `has missing endpoint for ${link.id}`);
        }
        if (link.from === link.to) {
            fail('map_invalid_domain', `${path}.atlas.links`, `has a self-link ${link.id}`);
        }
    }
    const actorByKey = new Map(actors.map(actor => [actor.actorKey, actor]));
    for (const actor of actors) {
        if (!locationByKey.has(actor.locationKey)) {
            fail('map_invalid_domain', `${path}.atlas.actors`, `has missing location for ${actor.actorKey}`);
        }
    }
    const renderedActors = new Set<string>();
    for (const scene of Object.values(scenes)) {
        for (const element of scene.elements) {
            if (element.category !== 'actor') {continue;}
            const actor = actorByKey.get(element.actorKey as string);
            if (!actor) {
                fail('map_invalid_domain', `${path}.scenes.${scene.key}`, `has unknown actor ${element.actorKey}`);
            }
            const location = locationByKey.get(actor.locationKey) as MapLocation;
            if (location.sceneKey !== scene.key) {
                fail('map_invalid_domain', `${path}.scenes.${scene.key}`, `renders actor ${actor.actorKey} at the wrong location`);
            }
            if (renderedActors.has(actor.actorKey)) {
                fail('map_invalid_domain', `${path}.scenes`, `renders actor ${actor.actorKey} more than once`);
            }
            renderedActors.add(actor.actorKey);
        }
    }
}

/** Validates the serialized V1 shape and all cross-Atlas/Scene invariants. */
export function validateMapDomain(value: unknown, path = 'domains.map'): asserts value is MapDomainV1 {
    const root = requireRecord(value, path);
    requireKeys(root, ['schemaVersion', 'revision', 'atlas', 'scenes'], [], path);
    if (root.schemaVersion !== MAP_DOMAIN_SCHEMA_VERSION) {
        fail('map_unsupported_version', `${path}.schemaVersion`, 'is unsupported');
    }
    if (!Number.isSafeInteger(root.revision) || Number(root.revision) < 0) {
        fail('map_invalid_domain', `${path}.revision`, 'must be a non-negative safe integer');
    }

    const atlas = requireRecord(root.atlas, `${path}.atlas`);
    requireKeys(atlas, ['locations', 'links', 'actors'], [], `${path}.atlas`);
    if (!Array.isArray(atlas.locations) || !Array.isArray(atlas.links) || !Array.isArray(atlas.actors)) {
        fail('map_invalid_domain', `${path}.atlas`, 'collections must be arrays');
    }
    if (atlas.locations.length > MAX_MAP_LOCATIONS || atlas.links.length > MAX_MAP_LINKS || atlas.actors.length > MAX_MAP_ACTORS) {
        fail('map_collection_limit', `${path}.atlas`, 'exceeds an Atlas collection limit');
    }
    const locations = atlas.locations.map((entry, index) => validateLocation(entry, `${path}.atlas.locations.${index}`));
    const links = atlas.links.map((entry, index) => validateLink(entry, `${path}.atlas.links.${index}`));
    const actors = atlas.actors.map((entry, index) => validateActor(entry, `${path}.atlas.actors.${index}`));
    requireUnique(locations, location => location.key, `${path}.atlas.locations`);
    requireUnique(links, link => link.id, `${path}.atlas.links`);
    requireUnique(actors, actor => actor.actorKey, `${path}.atlas.actors`);

    const sceneRecords = requireRecord(root.scenes, `${path}.scenes`);
    const sceneEntries = Object.entries(sceneRecords);
    if (sceneEntries.length > MAX_SCENES) {
        fail('map_collection_limit', `${path}.scenes`, `exceeds ${MAX_SCENES}`);
    }
    const scenes: Record<string, MapScene> = Object.create(null) as Record<string, MapScene>;
    for (const [recordKey, sceneValue] of sceneEntries) {
        requireId(recordKey, `${path}.scenes key`);
        const scene = validateScene(sceneValue, `${path}.scenes.${recordKey}`);
        if (scene.key !== recordKey) {
            fail('map_invalid_domain', `${path}.scenes.${recordKey}.key`, 'must match its record key');
        }
        scenes[recordKey] = scene;
    }

    validateReferences(locations, links, actors, scenes, path);
    let bytes: number;
    try {
        bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength;
    } catch {
        fail('map_invalid_domain', path, 'must be JSON serializable');
    }
    if (bytes > MAX_MAP_BYTES) {
        fail('map_size_limit', path, `exceeds ${MAX_MAP_BYTES} UTF-8 bytes`);
    }
}

export function parseMapDomain(value: unknown, path = 'domains.map'): MapDomainV1 {
    validateMapDomain(value, path);
    return structuredClone(value);
}
