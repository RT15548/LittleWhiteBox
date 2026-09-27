import type { AcceptedTurnPlayer } from '../../../capabilities/maintenance/accepted-turn-source.js';
import type { MapDomainEdit } from '../../../domains/map/edit.js';
import { isMapSceneLocation, locationRegion } from '../../../domains/map/hierarchy.js';
import { MAP_REGION_REQUIRED_HINT, MAP_SCENE_LOCATION_REQUIRED_HINT } from './hierarchy-feedback.js';
import { MAX_MAP_LABEL_LENGTH, MAX_SCENE_ELEMENTS } from '../../../domains/map/invariants.js';
import {
    MAP_CERTAINTIES,
    MAP_ELEMENT_CATEGORIES,
    MAP_ELEMENT_KINDS,
    MAP_ELEMENT_SHAPES,
    MAP_ICON_TOKENS,
    MAP_MATERIALS,
    MAP_TERRAIN_CATEGORY_ALIASES,
} from '../../../domains/map/semantics.js';
import type {
    MapDomainV1,
    MapElement,
    MapElementCategory,
    MapElementShape,
    MapLocation,
    MapSceneMood,
} from '../../../domains/map/types.js';
import { mapToolResult, type MapToolItemReport, type MapToolResult } from './result.js';
import {
    applyIntentEdits,
    enumToken,
    errorText,
    finiteNumber,
    intentId,
    intentText,
    isRecord,
    point,
    points,
    positiveNumber,
    positivePair,
} from './intent-common.js';

const SCENE_MOODS: readonly MapSceneMood[] = ['neutral', 'warm', 'cold', 'dark', 'mystic', 'danger', 'calm'];
const ROOT_FIELDS = new Set(['scene', 'playerHere', 'viewBox', 'mood', 'elements', 'remove']);
const ELEMENT_FIELDS = new Set(['id', 'cat', 'kind', 'shape', 'geo', 'label', 'actorKey', 'icon', 'material', 'certainty', 'closed', 'rotation']);
// geo.icon was accepted by the original intent compiler and remains a deliberate tolerant input.
const GEO_FIELDS = new Set(['center', 'at', 'size', 'radius', 'points', 'curve', 'icon']);
const missingActorName = (id: string) => `Actor ${id} has no displayed name; set label to the character's name.`;

export interface SceneIntentCompileResult {
    readonly domain: MapDomainV1;
    readonly edits: readonly MapDomainEdit[];
    readonly result: MapToolResult;
}

function unsupportedFields(value: Record<string, unknown>, allowed: ReadonlySet<string>): string[] {
    return Object.keys(value).filter(key => !allowed.has(key));
}

function category(value: unknown, shape: MapElementShape, warnings: string[], id: string): MapElementCategory {
    const raw = String(value || '').trim().toLowerCase();
    if (MAP_TERRAIN_CATEGORY_ALIASES.has(raw)) {
        warnings.push(`Normalized terrain category alias "${raw}" for ${id}.`);
        return 'terrain';
    }
    const normalized = enumToken(raw, MAP_ELEMENT_CATEGORIES);
    if (normalized) {return normalized;}
    if (raw) {warnings.push(`Ignored unsupported category "${raw}" for ${id}.`);}
    if (shape === 'label') {return 'label';}
    if (shape === 'path' || shape === 'curve') {return 'road';}
    if (shape === 'icon') {return 'marker';}
    return 'terrain';
}

function usableShape(shape: MapElementShape, geo: Record<string, unknown>, label: string): boolean {
    if (shape === 'rect') {return !!point(geo.center) && !!positivePair(geo.size);}
    if (shape === 'circle') {return !!point(geo.at) && positiveNumber(geo.radius) !== null;}
    if (shape === 'path') {return !!points(geo.points);}
    if (shape === 'curve') {return !!points(geo.curve);}
    if (shape === 'icon') {return !!point(geo.at);}
    return !!point(geo.at) && !!label;
}

function shapeOrder(value: unknown): readonly MapElementShape[] {
    const raw = String(value || '').trim().toLowerCase();
    const cat = MAP_TERRAIN_CATEGORY_ALIASES.has(raw)
        ? 'terrain'
        : enumToken(raw, MAP_ELEMENT_CATEGORIES);
    if (cat === 'door') {return ['icon', 'path', 'rect', 'circle', 'label'];}
    if (cat === 'actor') {return ['icon', 'circle', 'label'];}
    if (cat === 'light') {return ['circle', 'rect', 'icon', 'label'];}
    if (cat === 'road') {return ['path', 'curve', 'rect', 'label'];}
    if (cat === 'wall') {return ['rect', 'path', 'curve', 'label'];}
    if (cat === 'label') {return ['label'];}
    if (cat === 'terrain' || cat === 'water' || cat === 'magic' || cat === 'danger') {
        return ['rect', 'circle', 'path', 'curve', 'icon', 'label'];
    }
    if (cat === 'furniture' || cat === 'decoration') {return ['rect', 'circle', 'icon', 'label'];}
    return ['rect', 'circle', 'path', 'curve', 'icon', 'label'];
}

function inferShape(cat: unknown, geo: Record<string, unknown>, label: string): MapElementShape | null {
    for (const shape of shapeOrder(cat)) {
        if (usableShape(shape, geo, label)) {return shape;}
    }
    return null;
}

function compileElement(
    raw: unknown,
    index: number,
    player: AcceptedTurnPlayer,
    warnings: string[],
    existing?: MapElement,
): { id: string; element: MapElement } {
    if (!isRecord(raw)) {throw new Error('element_must_be_object');}
    const id = intentId(raw.id);
    if (!id) {throw new Error(`element_id_required:${index + 1}`);}
    const elementUnknown = unsupportedFields(raw, ELEMENT_FIELDS);
    if (elementUnknown.length) {throw new Error(`element_has_unsupported_fields:${elementUnknown.join(',')}`);}
    if (!existing && raw.cat === undefined) {throw new Error(`new_element_requires_category:${id}`);}
    if (
        !existing
        && !MAP_TERRAIN_CATEGORY_ALIASES.has(String(raw.cat || '').trim().toLowerCase())
        && !enumToken(raw.cat, MAP_ELEMENT_CATEGORIES)
    ) {
        throw new Error(`new_element_has_unsupported_category:${id}`);
    }

    const hasGeoPatch = Object.hasOwn(raw, 'geo') || Object.hasOwn(raw, 'shape');
    let shape = existing?.shape;
    let geometry: MapElement['geometry'] | undefined = existing
        ? structuredClone(existing.geometry)
        : undefined;
    let label = existing?.label || '';
    if (Object.hasOwn(raw, 'label')) {
        if (raw.label === null) {label = '';}
        else {
            const normalized = intentText(raw.label, '', MAX_MAP_LABEL_LENGTH);
            if (normalized) {label = normalized;}
            else {warnings.push(`Ignored invalid label for ${id}.`);}
        }
    }

    if (!existing || hasGeoPatch) {
        if (!isRecord(raw.geo)) {
            throw new Error(existing ? `shape_and_geo_required:${id}` : `new_element_requires_geo:${id}`);
        }
        const geoUnknown = unsupportedFields(raw.geo, GEO_FIELDS);
        if (geoUnknown.length) {throw new Error(`geo_has_unsupported_fields:${geoUnknown.join(',')}`);}
        const explicitShape = enumToken(raw.shape, MAP_ELEMENT_SHAPES);
        const inferred = inferShape(existing?.category ?? raw.cat, raw.geo, label);
        shape = explicitShape || (raw.shape === undefined ? existing?.shape : undefined);
        if (shape && !usableShape(shape, raw.geo, label) && inferred && inferred !== shape) {
            warnings.push(`Shape "${shape}" for ${id} had unusable geo; used "${inferred}" instead.`);
            shape = inferred;
        } else if (!shape && inferred) {
            shape = inferred;
            warnings.push(`Inferred shape "${shape}" for ${id}.`);
        }
        if (!shape) {throw new Error(`shape_or_matching_geo_required:${id}`);}
        if (shape === 'rect') {
            const center = point(raw.geo.center);
            const size = positivePair(raw.geo.size);
            if (!center || !size) {throw new Error(`rect_requires_center_and_size:${id}`);}
            geometry = { x: center[0] - size[0] / 2, y: center[1] - size[1] / 2, width: size[0], height: size[1] };
        } else if (shape === 'circle') {
            const at = point(raw.geo.at);
            const radius = positiveNumber(raw.geo.radius);
            if (!at || radius === null) {throw new Error(`circle_requires_at_and_radius:${id}`);}
            geometry = { x: at[0], y: at[1], radius };
        } else if (shape === 'path' || shape === 'curve') {
            const list = points(shape === 'path' ? raw.geo.points : raw.geo.curve);
            if (!list) {throw new Error(`${shape}_requires_two_points:${id}`);}
            geometry = { points: list };
        } else {
            const at = point(raw.geo.at);
            if (!at) {throw new Error(`${shape}_requires_at:${id}`);}
            geometry = { x: at[0], y: at[1] };
        }
    }
    if (!shape || !geometry) {throw new Error(`new_element_requires_geo:${id}`);}

    let cat: MapElementCategory;
    if (existing) {
        cat = existing.category;
        if (Object.hasOwn(raw, 'cat')) {
            const rawCategory = String(raw.cat || '').trim().toLowerCase();
            const requestedCategory = MAP_TERRAIN_CATEGORY_ALIASES.has(rawCategory)
                ? 'terrain'
                : enumToken(rawCategory, MAP_ELEMENT_CATEGORIES);
            if (!requestedCategory) {
                warnings.push(`Ignored unsupported category "${rawCategory}" for ${id}; existing category is stable.`);
            } else if (requestedCategory !== cat) {
                warnings.push(`Ignored category change from "${cat}" to "${requestedCategory}" for ${id}; existing category is stable.`);
            }
        }
    } else {
        cat = category(raw.cat, shape, warnings, id);
    }
    const element: MapElement = existing
        ? { ...structuredClone(existing), id, category: cat, shape, geometry }
        : { id, category: cat, shape, geometry };

    if (Object.hasOwn(raw, 'kind')) {
        if (raw.kind === null) {delete element.kind;}
        else {
            const kind = enumToken(raw.kind, MAP_ELEMENT_KINDS);
            if (kind) {element.kind = kind;}
            else {warnings.push(`Ignored unsupported kind for ${id}.`);}
        }
    }
    const geoIcon = isRecord(raw.geo) && Object.hasOwn(raw.geo, 'icon') ? raw.geo.icon : undefined;
    if (Object.hasOwn(raw, 'icon') || geoIcon !== undefined) {
        if (raw.icon === null) {delete element.icon;}
        else {
            const icon = enumToken(Object.hasOwn(raw, 'icon') ? raw.icon : geoIcon, MAP_ICON_TOKENS);
            if (icon) {element.icon = icon;}
            else {warnings.push(`Ignored unsupported icon for ${id}.`);}
        }
    }
    if (Object.hasOwn(raw, 'label')) {
        if (raw.label === null) {delete element.label;}
        else if (label) {element.label = label;}
    }
    if (Object.hasOwn(raw, 'material')) {
        if (raw.material === null) {delete element.material;}
        else {
            const material = enumToken(raw.material, MAP_MATERIALS);
            if (material) {element.material = material;}
            else {warnings.push(`Ignored unsupported material for ${id}.`);}
        }
    }
    if (Object.hasOwn(raw, 'certainty')) {
        if (raw.certainty === null) {delete element.certainty;}
        else {
            const certainty = enumToken(raw.certainty, MAP_CERTAINTIES);
            if (certainty) {element.certainty = certainty;}
            else {warnings.push(`Ignored unsupported certainty for ${id}.`);}
        }
    }
    if (Object.hasOwn(raw, 'closed')) {
        if (raw.closed === null) {delete element.closed;}
        else if (typeof raw.closed === 'boolean') {element.closed = raw.closed;}
        else {warnings.push(`Ignored invalid closed value for ${id}.`);}
    }
    if (shape !== 'path' && shape !== 'curve') {delete element.closed;}
    if (Object.hasOwn(raw, 'rotation')) {
        if (raw.rotation === null) {delete element.rotation;}
        else if (typeof raw.rotation !== 'number' || !Number.isFinite(raw.rotation) || raw.rotation < 0 || raw.rotation >= 360) {
            throw new Error(`rotation_requires_finite_angle_in_0_to_360_exclusive:${id}`);
        } else {element.rotation = raw.rotation;}
    }
    if (element.rotation !== undefined && shape !== 'rect' && shape !== 'circle') {
        throw new Error(`rotation_requires_rect_or_circle_clear_rotation_with_null:${id}`);
    }

    if (cat === 'actor') {
        const priorActorKey = existing?.category === 'actor' ? existing.actorKey : undefined;
        let requestedActorKey = Object.hasOwn(raw, 'actorKey')
            ? intentId(raw.actorKey)
            : priorActorKey || id;
        if (priorActorKey) {
            const canonicalRequest = requestedActorKey === 'user' ? 'player' : requestedActorKey;
            if (Object.hasOwn(raw, 'actorKey') && canonicalRequest !== priorActorKey) {
                warnings.push(`Ignored actorKey change for ${id}; existing actor identity "${priorActorKey}" is stable.`);
            }
            requestedActorKey = priorActorKey;
        }
        if (!requestedActorKey) {throw new Error(`actor_key_required:${id}`);}
        const isPlayer = existing
            ? requestedActorKey === 'player'
            : requestedActorKey === 'player'
                || requestedActorKey === 'user'
                || (!Object.hasOwn(raw, 'actorKey') && element.kind === 'player');
        element.actorKey = isPlayer ? 'player' : requestedActorKey;
        if (isPlayer) {
            element.kind = 'player';
            element.label = player.displayName;
        } else if (element.kind === 'player') {
            element.kind = 'actor';
            warnings.push(`Ignored player kind for actor ${id}; actor identity is "${element.actorKey}".`);
        } else if (!element.kind) {
            element.kind = 'actor';
        }
    } else {
        if (raw.actorKey !== undefined && raw.actorKey !== null) {
            warnings.push(`Ignored actorKey on non-actor element ${id}.`);
        }
        delete element.actorKey;
        if (existing?.category === 'actor' && raw.kind === undefined && (element.kind === 'actor' || element.kind === 'player')) {
            delete element.kind;
        }
    }
    if (shape === 'label' && !element.label) {throw new Error(`label_text_required:${id}`);}
    return { id, element };
}

function findLocation(domain: MapDomainV1, scene: string): MapLocation | undefined {
    return domain.atlas.locations.find(location => location.key === scene)
        || domain.atlas.locations.find(location => location.sceneKey === scene)
        || domain.atlas.locations.find(location => location.name === scene);
}

function actorMoveEdits(
    domain: MapDomainV1,
    actorKey: string,
    displayName: string,
    locationKey: string,
    keep?: { sceneKey: string; elementId?: string },
): MapDomainEdit[] {
    const edits: MapDomainEdit[] = [];
    for (const scene of Object.values(domain.scenes)) {
        for (const element of scene.elements) {
            if (
                element.category === 'actor'
                && element.actorKey === actorKey
                && (!keep || scene.key !== keep.sceneKey || (keep.elementId !== undefined && element.id !== keep.elementId))
            ) {
                edits.push({ op: 'remove-element', sceneKey: scene.key, elementId: element.id });
            }
        }
    }
    edits.push({ op: 'set-actor-position', position: { actorKey, displayName, locationKey } });
    return edits;
}

export function compileSceneIntent(
    current: MapDomainV1,
    value: unknown,
    player: AcceptedTurnPlayer,
): SceneIntentCompileResult {
    if (!isRecord(value)) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: '', reason: 'arguments_must_be_object' }] }) };
    }
    const rootUnknown = unsupportedFields(value, ROOT_FIELDS);
    if (rootUnknown.length) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{ index: 0, id: '', reason: 'scene_has_unsupported_fields', hint: `Remove unsupported fields: ${rootUnknown.join(', ')}.` }],
            }),
        };
    }
    if (value.elements !== undefined && !Array.isArray(value.elements)) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: intentId(value.scene), reason: 'scene_elements_must_be_array' }] }) };
    }
    if (value.remove !== undefined && !Array.isArray(value.remove)) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: intentId(value.scene), reason: 'scene_remove_must_be_array' }] }) };
    }
    const rawElements = Array.isArray(value.elements) ? value.elements : [];
    const rawRemovals = Array.isArray(value.remove) ? value.remove : [];
    const oversizedCollection = rawElements.length > MAX_SCENE_ELEMENTS
        ? 'elements'
        : rawRemovals.length > MAX_SCENE_ELEMENTS ? 'remove' : '';
    if (oversizedCollection) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{
                    index: 0,
                    id: intentId(value.scene),
                    reason: oversizedCollection === 'elements'
                        ? 'scene_elements_exceed_limit'
                        : 'scene_remove_exceeds_limit',
                    hint: `Send at most ${MAX_SCENE_ELEMENTS} ${oversizedCollection} entries in one MapSceneEdit call.`,
                }],
            }),
        };
    }
    const sceneName = intentId(value.scene);
    if (!sceneName) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: sceneName, reason: 'scene_required' }] }) };
    }

    let working = current;
    const edits: MapDomainEdit[] = [];
    const warnings: string[] = [];
    const applied: MapToolItemReport[] = [];
    const skipped: MapToolItemReport[] = [];
    let changed = false;
    const existingLocation = findLocation(working, sceneName);
    if (!existingLocation || !isMapSceneLocation(existingLocation)) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: sceneName, reason: 'scene_location_required', hint: MAP_SCENE_LOCATION_REQUIRED_HINT }] }) };
    }
    if (!locationRegion(working.atlas, existingLocation.key)) {
        return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: sceneName, reason: 'location_region_required', hint: MAP_REGION_REQUIRED_HINT }] }) };
    }
    const locationKey = existingLocation.key;
    const sceneKey = existingLocation.sceneKey || locationKey;
    const title = existingLocation.name;
    const viewBox = Array.isArray(value.viewBox) && value.viewBox.length === 4
        ? value.viewBox.map(finiteNumber) : null;
    const validViewBox = viewBox?.every((entry): entry is number => entry !== null)
        && (viewBox[2] as number) > 0 && (viewBox[3] as number) > 0
        ? viewBox as [number, number, number, number]
        : undefined;
    if (value.viewBox !== undefined && !validViewBox) {warnings.push('Ignored invalid scene viewBox.');}
    const mood = enumToken(value.mood, SCENE_MOODS);
    if (value.mood !== undefined && value.mood !== null && !mood) {warnings.push('Ignored invalid scene mood.');}

    if (!existingLocation.sceneKey && rawElements.length === 0 && rawRemovals.length === 0) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({
                skipped: [{ index: 0, id: sceneName, reason: 'new_scene_requires_elements', hint: 'Draw a main surface or boundary and confirmed anchors.' }],
            }),
        };
    }
    const setup: MapDomainEdit[] = [];
    const nextLocation: MapLocation = {
        ...existingLocation,
        sceneKey,
    };
    setup.push({ op: 'upsert-location', location: nextLocation });
    const existingScene = working.scenes[sceneKey];
    if (!existingScene) {
        setup.push({
            op: 'initialize-scene',
            scene: { key: sceneKey, name: title, status: 'active', viewBox: validViewBox || [0, 0, 400, 300], ...(mood ? { mood } : {}) },
        });
    } else {
        const changes: Record<string, unknown> = { name: title, status: 'active' };
        if (validViewBox) {changes.viewBox = validViewBox;}
        if (mood) {changes.mood = mood;}
        else if (value.mood === null) {changes.mood = null;}
        setup.push({ op: 'update-scene', sceneKey, changes });
    }
    if (value.playerHere === true) {
        setup.push(...actorMoveEdits(working, 'player', player.displayName, locationKey, { sceneKey }));
    }
    try {
        const next = applyIntentEdits(working, setup);
        working = next.domain;
        changed ||= next.changed;
        edits.push(...setup);
    } catch (error) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({ skipped: [{ index: 0, id: sceneName, reason: errorText(error), hint: 'Correct the scene identity or hierarchy and retry.' }], warnings }),
        };
    }

    rawRemovals.forEach((raw, index) => {
        const id = intentId(raw);
        if (!id) {
            skipped.push({ collection: 'remove', index, id: '', reason: 'element_id_required' });
            return;
        }
        const itemEdits: MapDomainEdit[] = [{ op: 'remove-element', sceneKey, elementId: id }];
        try {
            const next = applyIntentEdits(working, itemEdits);
            working = next.domain;
            changed ||= next.changed;
            edits.push(...itemEdits);
            applied.push({ collection: 'remove', index, id, changed: next.changed });
        } catch (error) {
            skipped.push({ collection: 'remove', index, id, reason: errorText(error), hint: 'Use an element id from this scene.' });
        }
    });

    rawElements.forEach((raw, index) => {
        const id = isRecord(raw) ? intentId(raw.id) : '';
        try {
            const existingElement = working.scenes[sceneKey]?.elements.find(element => element.id === id);
            const compiled = compileElement(raw, index, player, warnings, existingElement);
            const elementEdits: MapDomainEdit[] = [];
            if (compiled.element.category === 'actor' && compiled.element.actorKey) {
                const { actorKey } = compiled.element;
                const existingActor = working.atlas.actors.find(actor => actor.actorKey === actorKey);
                const knownName = existingActor?.displayName !== actorKey ? existingActor?.displayName : undefined;
                if (actorKey !== 'player' && !compiled.element.label && isRecord(raw) && !Object.hasOwn(raw, 'label')) {
                    if (knownName) {compiled.element.label = knownName;}
                    else {warnings.push(missingActorName(compiled.element.id));}
                }
                elementEdits.push(...actorMoveEdits(
                    working,
                    actorKey,
                    actorKey === 'player'
                        ? player.displayName
                        : compiled.element.label || existingActor?.displayName || actorKey,
                    locationKey,
                    { sceneKey, elementId: compiled.element.id },
                ));
            }
            elementEdits.push({ op: 'upsert-element', sceneKey, element: compiled.element });
            const next = applyIntentEdits(working, elementEdits);
            working = next.domain;
            changed ||= next.changed;
            edits.push(...elementEdits);
            applied.push({ collection: 'elements', index, id: compiled.id, changed: next.changed });
        } catch (error) {
            skipped.push({ collection: 'elements', index, id, reason: errorText(error), hint: 'Retry only this id with corrected fields. Omit unchanged fields; send complete geo only when changing geometry. A rotation-only correction needs only id and rotation ([0,360), or null to clear).' });
        }
    });

    if ((rawElements.length > 0 || rawRemovals.length > 0) && applied.length === 0 && skipped.length > 0) {
        return {
            domain: current,
            edits: [],
            result: mapToolResult({ applied, skipped, warnings, hint: 'No scene changes were staged; fix the skipped elements.' }),
        };
    }
    return { domain: working, edits, result: mapToolResult({ changed, applied, skipped, warnings }) };
}
