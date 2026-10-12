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
} from '../../../domains/map/types.js';
import { mapToolFailure, mapToolResult, type MapToolItemReport, type MapToolResult } from './result.js';
import { mapTools, MAP_MAINTENANCE_TOOL_NAMES } from './tool-contract.js';
import { collectToolInputIssues, ToolInputError } from '../../../../agent-core/runtime/tool-input-validation.js';
import {
    applyIntentEdits,
    enumToken,
    finiteNumber,
    intentId,
    intentText,
    isRecord,
    point,
    points,
    positiveNumber,
    positivePair,
} from './intent-common.js';

const missingActorName = (id: string) => `Actor ${id} has no displayed name; set label to the character's name.`;
const sceneSchema = mapTools('').find(tool => tool.function.name === MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT)!.function.parameters;
const sceneProperties = sceneSchema.properties as Record<string, Record<string, unknown>>;
const elementSchema = sceneProperties.elements.items as Record<string, unknown>;
const ROOT_FIELDS = new Set(Object.keys(sceneProperties));
const ELEMENT_FIELDS = new Set(Object.keys(elementSchema.properties as Record<string, unknown>));

export interface SceneIntentCompileResult {
    readonly domain: MapDomainV1;
    readonly edits: readonly MapDomainEdit[];
    readonly result: MapToolResult;
}

function unsupportedFields(value: Record<string, unknown>, allowed: ReadonlySet<string>): string[] {
    return Object.keys(value).filter(key => !allowed.has(key));
}

function category(value: unknown, warnings: string[], id: string): MapElementCategory {
    const raw = String(value || '').trim().toLowerCase();
    if (MAP_TERRAIN_CATEGORY_ALIASES.has(raw)) {
        warnings.push(`Normalized terrain category alias "${raw}" for ${id}.`);
        return 'terrain';
    }
    return enumToken(raw, MAP_ELEMENT_CATEGORIES)!;
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
    // Preserve the established terrain and geo.icon spellings without changing requested meaning.
    const input = { ...raw };
    if (MAP_TERRAIN_CATEGORY_ALIASES.has(String(raw.cat || '').trim().toLowerCase())) { input.cat = 'terrain'; }
    if (isRecord(raw.geo) && Object.hasOwn(raw.geo, 'icon')) {
        const { icon, ...geo } = raw.geo;
        input.geo = geo;
        if (input.icon === undefined) { input.icon = icon; }
    }
    const inputIssues = collectToolInputIssues(input, elementSchema, `elements[${index}]`);
    if (inputIssues.length) { throw new ToolInputError(inputIssues); }
    if (!existing && raw.cat === undefined) {throw new Error(`new_element_requires_category:${id}`);}
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
            else {throw new ToolInputError([{ code: 'invalid_value', path: `elements[${index}].label`, message: 'Use non-empty label text, or null to clear it.', expected: { type: ['string', 'null'], minLength: 1 } }]);}
        }
    }

    if (!existing || hasGeoPatch) {
        if (!isRecord(raw.geo)) {
            throw new Error(existing ? `shape_and_geo_required:${id}` : `new_element_requires_geo:${id}`);
        }
        const explicitShape = enumToken(raw.shape, MAP_ELEMENT_SHAPES);
        const inferred = inferShape(existing?.category ?? raw.cat, raw.geo, label);
        shape = explicitShape || (raw.shape === undefined ? existing?.shape : undefined);
        if (!explicitShape && shape && !usableShape(shape, raw.geo, label) && inferred && inferred !== shape) {
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
            if (requestedCategory !== cat) {
                throw new ToolInputError([{ code: 'identity_conflict', path: `elements[${index}].cat`, message: 'Use the existing category for this ID, or a new ID for another entity.', expected: { enum: [cat] } }]);
            }
        }
    } else {
        cat = category(raw.cat, warnings, id);
    }
    const element: MapElement = existing
        ? { ...structuredClone(existing), id, category: cat, shape, geometry }
        : { id, category: cat, shape, geometry };

    if (Object.hasOwn(raw, 'kind')) {
        if (raw.kind === null) {delete element.kind;}
        else {
            element.kind = enumToken(raw.kind, MAP_ELEMENT_KINDS)!;
        }
    }
    const geoIcon = isRecord(raw.geo) && Object.hasOwn(raw.geo, 'icon') ? raw.geo.icon : undefined;
    if (Object.hasOwn(raw, 'icon') || geoIcon !== undefined) {
        if (raw.icon === null) {delete element.icon;}
        else {
            element.icon = enumToken(Object.hasOwn(raw, 'icon') ? raw.icon : geoIcon, MAP_ICON_TOKENS)!;
        }
    }
    if (Object.hasOwn(raw, 'label')) {
        if (raw.label === null) {delete element.label;}
        else if (label) {element.label = label;}
    }
    if (Object.hasOwn(raw, 'material')) {
        if (raw.material === null) {delete element.material;}
        else {
            element.material = enumToken(raw.material, MAP_MATERIALS)!;
        }
    }
    if (Object.hasOwn(raw, 'certainty')) {
        if (raw.certainty === null) {delete element.certainty;}
        else {
            element.certainty = enumToken(raw.certainty, MAP_CERTAINTIES)!;
        }
    }
    if (Object.hasOwn(raw, 'closed')) {
        if (raw.closed === null) {delete element.closed;}
        else {element.closed = raw.closed as boolean;}
    }
    if (shape !== 'path' && shape !== 'curve') {delete element.closed;}
    if (Object.hasOwn(raw, 'rotation')) {
        if (raw.rotation === null) {delete element.rotation;}
        else if (typeof raw.rotation !== 'number' || !Number.isFinite(raw.rotation) || raw.rotation < 0 || raw.rotation >= 360) {
            throw new ToolInputError([{ code: 'invalid_value', path: `elements[${index}].rotation`, message: 'Rotation is an angle from 0 inclusive to 360 exclusive.', expected: { minimum: 0, exclusiveMaximum: 360 } }]);
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
                throw new ToolInputError([{ code: 'identity_conflict', path: `elements[${index}].actorKey`, message: 'This element belongs to another actor. Use its existing actorKey, or a new element ID.', expected: { enum: [priorActorKey] } }]);
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
            throw new ToolInputError([{ code: 'identity_conflict', path: `elements[${index}].kind`, message: 'Only the player actor has kind player.', expected: { actorKey: 'player' } }]);
        } else if (!element.kind) {
            element.kind = 'actor';
        }
    } else {
        if (raw.actorKey !== undefined && raw.actorKey !== null) {
            throw new ToolInputError([{ code: 'invalid_field', path: `elements[${index}].actorKey`, message: 'actorKey belongs to actor elements.', expected: { cat: 'actor' } }]);
        }
        delete element.actorKey;
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
    const header = Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'elements'));
    const headerIssues = collectToolInputIssues(header, sceneSchema);
    if (Array.isArray(value.viewBox) && value.viewBox.length === 4 && (Number(value.viewBox[2]) <= 0 || Number(value.viewBox[3]) <= 0)) {
        headerIssues.push({ code: 'invalid_value', path: 'viewBox', message: 'The viewBox width and height must be positive.', expected: { exclusiveMinimum: 0 } });
    }
    if (headerIssues.length) { return { domain: current, edits: [], result: mapToolResult({ skipped: [{ index: 0, id: intentId(value.scene), ...mapToolFailure(new ToolInputError(headerIssues)) }] }) }; }
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
    const mood = value.mood as MapDomainV1['scenes'][string]['mood'];
    const lighting = value.lighting as MapDomainV1['scenes'][string]['lighting'] | null;

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
            scene: { key: sceneKey, name: title, status: 'active', viewBox: validViewBox || [0, 0, 400, 300], ...(mood ? { mood } : {}), ...(lighting ? { lighting } : {}) },
        });
    } else {
        const changes: Record<string, unknown> = { name: title, status: 'active' };
        if (validViewBox) {changes.viewBox = validViewBox;}
        if (mood) {changes.mood = mood;}
        else if (value.mood === null) {changes.mood = null;}
        if (Object.hasOwn(value, 'lighting')) {changes.lighting = lighting;}
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
            result: mapToolResult({ skipped: [{ index: 0, id: sceneName, ...mapToolFailure(error), hint: 'Correct the scene identity or hierarchy and retry.' }], warnings }),
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
            skipped.push({ collection: 'remove', index, id, ...mapToolFailure(error), hint: 'Use an element id from this scene.' });
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
            skipped.push({ collection: 'elements', index, id, ...mapToolFailure(error), hint: 'Retry only this id with corrected fields. Omit unchanged fields; send complete geo only when changing geometry. A rotation-only correction needs only id and rotation ([0,360), or null to clear).' });
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
