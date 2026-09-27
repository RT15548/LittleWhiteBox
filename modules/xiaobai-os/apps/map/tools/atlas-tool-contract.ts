import { MAX_MAP_COORDINATE, MAX_MAP_DIMENSION, MAX_MAP_ID_LENGTH, MAX_MAP_NAME_LENGTH, MAX_MAP_POINTS } from '../../../domains/map/invariants.js';
import { MAP_MATERIALS } from '../../../domains/map/semantics.js';
import { MAX_MAP_FEATURES, MAX_MAP_FRAMES, SPACE_EXTRA_MATERIALS, SPACE_FORMS, SPACE_ROLES } from '../../../domains/map/space/types.js';

export const ATLAS_COLLECTION_MODES = ['locations', 'links', 'actors', 'maps', 'features'] as const;
export const MAP_ATLAS_READ_CONTENT_DESCRIPTION = [
    'Read source facts in MapAtlasEdit vocabulary. Use collection reads to obtain existing identities and geometry before patching.',
    'data contains mode and revision. Summary adds counts for locations, links, actors, maps, features, needsRegion and needsBase, plus player (null when unrecorded). Collection reads add the named collection, count, returned, truncated and nextOffset.',
    'Locations include hasScene and needsRegion. hasScene means an internal layout exists, not that it is complete. needsRegion marks a concrete place lacking a region ancestor. Read status includes visits to containing places.',
    'Maps contain map, mapping? and boundary?. World and region maps also return read-only baseCoverage: hasBase and uncoveredLocationKeys. needsBase counts maps without a base or with uncovered positioned entrances. Features contain their source map and complete editable geometry, not a clipped fragment of another map.',
    'Continue with nextOffset while it is not null, keeping the same collection and filters.',
].join('\n');
export const MAP_ATLAS_SPATIAL_GUIDANCE = [
    '## Atlas space',
    'The world and its regions use the same geometry for nature, settlements, oceans, artificial interiors, space and unusual environments. A region is an exploration area, not necessarily a land district.',
    'You establish surfaces, major outlines and paths; the app generates trees, dunes, mountain shading, roofs and material details. Generated details are not destinations. A real landmark reuses its location identity through destination.',
    'A complete atlas has an environment or main surface appropriate to its setting, major geography and positioned entrances. Establish that base before adding local detail. A terrain tag on a location describes the place; it does not draw a surface. Read-only baseCoverage and edit data.baseGaps identify missing coverage, not a visual quality score.',
    'World and region are separate browsing scales. World-owned geography and region outlines appear in the world overview. Geography owned by a region or a place inside it appears when entering that region; a specific destination building footprint appears in its region. Expressing its coordinates in another map does not move it to another browsing scale.',
    'Build one shared world source for cross-region geography. Add local streets and building exteriors in their region; furniture, interior rooms and visible people belong to MapSceneEdit. Region outlines and world terrain provide the overview without copies of local detail.',
    'Containment and coordinates are independent. Place a destination in a chosen map even when it belongs inside a building or floor. Missing mappings remain unknown until the setting provides a relation; a place position does not establish its local origin.',
    'Cross-region features have one surviving common owner and one source geometry. A region shows an external projection only when its mapping and boundary are known. A city built-up area is separate from its region boundary.',
    'A link establishes connectivity. Its optional feature references an actual channel geometry; connectivity alone draws no road. Intersections do not establish crossings or connectivity.',
    'Water masks same-surface vegetation and structures. Use support for content carried by a surface, and crosses for a bridge or platform explicitly above other features. These relations describe space, not visual layer numbers.',
].join('\n');
export const ATLAS_MAP_SELECTOR = { anyOf: [{ type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Location key whose local map contains these coordinates.' }, { type: 'null', description: 'The outer atlas coordinate map.' }] } as const;
const point = { type: 'array', minItems: 2, maxItems: 2, items: { type: 'number', minimum: -MAX_MAP_COORDINATE, maximum: MAX_MAP_COORDINATE } } as const;
const id = { type: 'string', maxLength: MAX_MAP_ID_LENGTH } as const;
const nullableId = { type: ['string', 'null'], maxLength: MAX_MAP_ID_LENGTH } as const;
const number = { type: 'number', minimum: -MAX_MAP_COORDINATE, maximum: MAX_MAP_COORDINATE } as const;
const dimension = { type: 'number', minimum: 0, maximum: MAX_MAP_DIMENSION, description: 'Must be strictly greater than zero.' } as const;
export const ATLAS_POSITION_SCHEMA = { anyOf: [{ type: 'object', properties: { map: ATLAS_MAP_SELECTOR, at: point }, required: ['map', 'at'], additionalProperties: false }, { type: 'null' }], description: 'Position in the explicitly chosen map. Omit to preserve; null clears the position. All maps have a fixed orientation; smaller y is up.' } as const;
export const ATLAS_MAPS_SCHEMA = {
    type: 'array', maxItems: MAX_MAP_FRAMES,
    description: 'Declare or patch local maps. Coordinates keep their meaning when the viewport changes. A mapping moves all content of this map; omitted fields are preserved. A referenced local map can exist without a mapping.',
    items: { type: 'object', properties: {
        map: ATLAS_MAP_SELECTOR,
        mapping: { anyOf: [{ type: 'object', properties: { map: ATLAS_MAP_SELECTOR, scale: dimension, offset: point }, required: ['map', 'scale', 'offset'], additionalProperties: false }, { type: 'null' }], description: 'Known relation to another map: target point = scale * local point + offset. Positive uniform scale, no rotation. Null disconnects the mapping.' },
        boundary: { ...nullableId, description: 'ID of a closed feature in this local map used as its clipping boundary. The same geometry may also describe a surface. Null clears the boundary.' },
    }, required: ['map'], additionalProperties: false },
} as const;
export const ATLAS_FEATURES_SCHEMA = {
    type: 'array', maxItems: MAX_MAP_FEATURES,
    description: 'Patch source spatial features by id; absent features and omitted fields remain. New features require map, role, material and geometry. Their owner defaults to map. Reusing destination supplies its name; use name only for an independently named feature.',
    items: { type: 'object', properties: {
        id, map: ATLAS_MAP_SELECTOR,
        owner: { ...ATLAS_MAP_SELECTOR, description: 'Owner of this geography, defaulting to map. Its nearest region determines the browsing scope; null is world geography. Deleting the owner deletes this feature. A specific destination building footprint belongs to that destination’s region.' },
        role: { type: 'string', enum: SPACE_ROLES }, material: { type: 'string', enum: [...MAP_MATERIALS, ...SPACE_EXTRA_MATERIALS] },
        form: { anyOf: [{ type: 'string', enum: SPACE_FORMS }, { type: 'null' }], description: 'Known landscape or building form; omitted when the generic material and outline suffice.' },
        name: { type: ['string', 'null'], maxLength: MAX_MAP_NAME_LENGTH }, destination: nullableId, support: nullableId,
        crosses: { type: ['array', 'null'], maxItems: MAX_MAP_FEATURES, items: id, description: 'Features explicitly below this surface, structure or channel. Null clears the relation.' },
        reframe: { ...ATLAS_MAP_SELECTOR, description: 'Express existing geometry in another known map without moving it. The app converts coordinates. Use alone, without map or geometry.' },
        geometry: { anyOf: [
            { type: 'object', properties: { shape: { enum: ['rect'], type: 'string' }, x: number, y: number, width: dimension, height: dimension }, required: ['shape', 'x', 'y', 'width', 'height'], additionalProperties: false },
            { type: 'object', properties: { shape: { enum: ['circle'], type: 'string' }, x: number, y: number, radius: dimension }, required: ['shape', 'x', 'y', 'radius'], additionalProperties: false },
            { type: 'object', properties: { shape: { enum: ['point'], type: 'string' }, x: number, y: number }, required: ['shape', 'x', 'y'], additionalProperties: false },
            { type: 'object', properties: { shape: { type: 'string', enum: ['path', 'curve'] }, points: { type: 'array', minItems: 2, maxItems: MAX_MAP_POINTS, items: point }, closed: { type: 'boolean' }, width: { ...dimension, description: 'Actual width for an open line or band, in source map units. Closed areas use their perimeter.' } }, required: ['shape', 'points'], additionalProperties: false },
        ] },
    }, required: ['id'], additionalProperties: false },
} as const;
