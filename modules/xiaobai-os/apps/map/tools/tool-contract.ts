import type { MaintenanceFunctionDeclaration } from '../../../capabilities/maintenance/registry.js';
import {
    MAX_MAP_ACTORS,
    MAX_MAP_BRIEF_LENGTH,
    MAX_MAP_COORDINATE,
    MAX_MAP_DIMENSION,
    MAX_MAP_ID_LENGTH,
    MAX_MAP_LABEL_LENGTH,
    MAX_MAP_LINKS,
    MAX_MAP_LOCATIONS,
    MAX_MAP_NAME_LENGTH,
    MAX_MAP_POINTS,
    MAX_SCENE_ELEMENTS,
} from '../../../domains/map/invariants.js';
import {
    MAP_CERTAINTIES,
    MAP_ELEMENT_CATEGORIES,
    MAP_ELEMENT_KINDS,
    MAP_ELEMENT_SHAPES,
    MAP_ICON_TOKENS,
    MAP_MATERIALS,
    MAP_OBJECT_GROUPS,
} from '../../../domains/map/semantics.js';
import { DEFAULT_ATLAS_READ_LIMIT, MAX_ATLAS_QUERY_LENGTH, MAX_ATLAS_READ_LIMIT } from './atlas-reader.js';
import { atlasExamplesPrompt } from './atlas-examples.js';
import { ATLAS_COLLECTION_MODES, ATLAS_FEATURES_SCHEMA, ATLAS_MAPS_SCHEMA, ATLAS_MAP_SELECTOR, ATLAS_POSITION_SCHEMA, MAP_ATLAS_READ_CONTENT_DESCRIPTION } from './atlas-tool-contract.js';
import { MAX_MAP_FEATURES, MAX_MAP_FRAMES } from '../../../domains/map/space/types.js';

export const MAP_MAINTENANCE_TOOL_NAMES = Object.freeze({
    ATLAS_READ: 'MapAtlasRead',
    ATLAS_EDIT: 'MapAtlasEdit',
    SCENE_READ: 'MapSceneRead',
    SCENE_EDIT: 'MapSceneEdit',
});

const locationScale = ['world', 'region', 'city', 'district', 'building', 'floor', 'room', 'outdoor'];
const locationStatus = ['mentioned', 'visited'];
const linkKind = ['door', 'stairs', 'elevator', 'path', 'road', 'portal', 'passage'];
const mood = ['neutral', 'warm', 'cold', 'dark', 'mystic', 'danger', 'calm'];

const objectGuidance = MAP_OBJECT_GROUPS.map(group => `${group.name}: ${group.icons.join(', ')}. ${group.hint}`.trim()).join('\n');

const EDIT_ITEM_REPORTS = 'applied and skipped identify edits by index, id and, when available, collection. applied may include changed; skipped includes reason and hint. warnings lists additional notices.';
const READ_REPORT = 'Returns {ok,status,changed,applied,skipped,warnings,data}. A successful read has status unchanged and changed false; it does not edit the draft.';

export const MAP_SCENE_READ_DESCRIPTION = [
    'Read one scene layout in MapSceneEdit vocabulary: {scene,viewBox,mood?,elements}, or null when no layout exists.',
    'Use it to assess a layout or obtain current element IDs before patching it. Location names, scales and visit status belong to the atlas.',
].join('\n');

const coordinatePair = {
    type: 'array',
    items: { type: 'number', minimum: -MAX_MAP_COORDINATE, maximum: MAX_MAP_COORDINATE },
    minItems: 2,
    maxItems: 2,
} as const;

const pointList = {
    type: 'array',
    minItems: 2,
    maxItems: MAX_MAP_POINTS,
    items: coordinatePair,
} as const;

// Standard nullable enum; the Google SDK converts this to nullable + string enum.
// Keep the description on the non-null branch because that is the branch it retains.
function nullableEnum(values: readonly string[], description: string) {
    return { anyOf: [{ type: 'string', enum: [...values], description }, { type: 'null' }] };
}

export function mapTools(saveDescription: string): readonly MaintenanceFunctionDeclaration[] { return Object.freeze([
    {
        type: 'function',
        function: {
            name: MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ,
            description: [
                MAP_ATLAS_READ_CONTENT_DESCRIPTION,
                READ_REPORT,
                'Document mode adds the complete atlas with all five collections.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    mode: { type: 'string', enum: ['summary', 'document', ...ATLAS_COLLECTION_MODES], description: 'Default summary. Collection modes are paged.' },
                    map: { ...ATLAS_MAP_SELECTOR, description: 'Optional exact source map filter for maps/features. Omit to read all source maps.' },
                    query: { type: 'string', maxLength: MAX_ATLAS_QUERY_LENGTH, description: 'Case-insensitive text filter for the selected collection.' },
                    parent: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional exact parent key filter for locations.' },
                    status: { type: 'string', enum: locationStatus, description: 'Optional location status filter.' },
                    needsRegion: { type: 'boolean', description: 'Optional location filter for missing region ownership. Omit to include both assigned and unassigned places.' },
                    from: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional endpoint filter for links.' },
                    to: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional other-endpoint filter for links.' },
                    kind: { type: 'string', enum: linkKind, description: 'Optional link kind filter.' },
                    actorKey: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional exact actor key filter.' },
                    limit: { type: 'integer', minimum: 1, maximum: MAX_ATLAS_READ_LIMIT, description: `Records per page. Default ${DEFAULT_ATLAS_READ_LIMIT}, maximum ${MAX_ATLAS_READ_LIMIT}.` },
                    offset: { type: 'integer', minimum: 0, description: 'Zero-based record offset after filtering. Default 0.' },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT,
            description: [
                'Add, update or remove atlas locations, map relations, spatial features, routes and actor positions.',
                saveDescription,
                EDIT_ITEM_REPORTS,
                'Use it to establish places and their hierarchy before drawing their layouts with MapSceneEdit, or for movement between places.',
                'data.baseGaps lists world/region maps with missing base coverage as {map,hasBase,uncoveredLocationKeys}. These are completion hints, not a failure to save valid edits.',
                'Related containment, mapping, geometry, ownership and removal declarations are validated as one final candidate and accepted together. Independent groups may succeed separately. Omitted records remain unchanged.',
                atlasExamplesPrompt(),
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    maps: ATLAS_MAPS_SCHEMA,
                    features: ATLAS_FEATURES_SCHEMA,
                    locations: {
                        type: 'array',
                        maxItems: MAX_MAP_LOCATIONS,
                        description: `Upsert setting-authored or coherently created places, including unvisited destinations. Parents may appear anywhere in the same call. Declarations connected by existing or requested parent chains are validated and accepted together; independent groups can succeed separately. The atlas holds at most ${MAX_MAP_LOCATIONS} locations.`,
                        items: {
                            type: 'object',
                            properties: {
                                key: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Stable identity; keep it unchanged when the display name changes.' },
                                name: { type: 'string', maxLength: MAX_MAP_NAME_LENGTH, description: 'Stable in-world place name; respect author-provided names.' },
                                scale: { type: 'string', enum: locationScale, description: 'Place hierarchy scale; default room for a new location.' },
                                status: { type: 'string', enum: locationStatus, description: 'Confirmed discovery state. New places default to mentioned; the player\'s actual location is always visited.' },
                                parent: {
                                    type: ['string', 'null'],
                                    maxLength: MAX_MAP_ID_LENGTH,
                                    description: 'Existing or same-call parent key. Concrete places need a region ancestor, directly or through another place. Worlds and regions may be at the Atlas root; null clears their parent.',
                                },
                                brief: { type: 'string', maxLength: MAX_MAP_BRIEF_LENGTH, description: 'Short in-world description: what distinguishes this place and why someone might visit. Do not invent events that already happened.' },
                                position: ATLAS_POSITION_SCHEMA,
                                reframe: { ...ATLAS_MAP_SELECTOR, description: 'Express the existing position in another known map without moving it. Use alone, without position.' },
                                terrain: nullableEnum(['urban', 'plain', 'forest', 'water', 'mountain', 'desert', 'snow'], 'Use null to clear. Landscape of this place, used on the world map. Match the setting.'),
                            },
                            required: ['key', 'name'], additionalProperties: false,
                        },
                    },
                    links: {
                        type: 'array',
                        maxItems: MAX_MAP_LINKS,
                        description: `Upsert world routes between existing or same-call locations. Respect authored connections and add plausible connections for newly created destinations. The atlas holds at most ${MAX_MAP_LINKS} links.`,
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional. Omit for the stable endpoint/kind-derived id; use an explicit id only for parallel same-kind routes.' },
                                from: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Existing or same-call source location key.' },
                                to: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Existing or same-call destination location key.' },
                                kind: { type: 'string', enum: linkKind, description: 'Route type connecting the two places.' },
                                label: { type: 'string', maxLength: MAX_MAP_LABEL_LENGTH, description: 'Optional short route name.' },
                                bidirectional: { type: 'boolean', description: 'Defaults true.' },
                                feature: { type: ['string', 'null'], maxLength: MAX_MAP_ID_LENGTH, description: 'Optional ID of the actual open channel geometry. Null clears the geometry association; the connection remains.' },
                            },
                            required: ['from', 'to', 'kind'], additionalProperties: false,
                        },
                    },
                    actors: {
                        type: 'array',
                        maxItems: MAX_MAP_ACTORS,
                        description: `Set world-level actor locations. Use MapSceneEdit for visible player coordinates inside a scene. The atlas holds at most ${MAX_MAP_ACTORS} actors.`,
                        items: {
                            type: 'object',
                            properties: {
                                actorKey: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Stable actor identity. The player is always "player".' },
                                displayName: { type: 'string', maxLength: MAX_MAP_NAME_LENGTH, description: 'Optional current display name. Omit it to preserve an existing actor name.' },
                                locationKey: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Existing or same-call location key the actor is now in.' },
                            },
                            required: ['actorKey', 'locationKey'], additionalProperties: false,
                        },
                    },
                    remove: {
                        type: 'object',
                        description: 'Remove records for correction or destruction. A location deletion cascades to descendants and their owned maps/features, routes, actor positions and scenes. Independent features merely associated with a destination survive; references to a deleted support must be repaired in this same call.',
                        properties: {
                            locationKeys: { type: 'array', maxItems: MAX_MAP_LOCATIONS, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
                            linkIds: { type: 'array', maxItems: MAX_MAP_LINKS, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
                            actorKeys: { type: 'array', maxItems: MAX_MAP_ACTORS, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
                            maps: { type: 'array', maxItems: MAX_MAP_FRAMES, items: ATLAS_MAP_SELECTOR },
                            featureIds: { type: 'array', maxItems: MAX_MAP_FEATURES, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ,
            description: [
                MAP_SCENE_READ_DESCRIPTION,
                READ_REPORT,
                'data contains revision and scene.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    scene: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Owning location key, also used by MapSceneEdit.scene.' },
                },
                required: ['scene'], additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT,
            description: [
                'Create or patch the internal layout of an existing concrete atlas place with a containing region.',
                saveDescription,
                EDIT_ITEM_REPORTS,
                'Use it for the spatial arrangement of a place and visible actor positions. Elements absent from the call remain untouched.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    scene: {
                        type: 'string',
                        maxLength: MAX_MAP_ID_LENGTH,
                        description: 'Owning atlas location key. Establish the place and its region with MapAtlasEdit before drawing its layout.',
                    },
                    playerHere: { type: 'boolean', description: 'True when the player is inside this scene now. This makes the place visited. Also send a player element so the visible position updates.' },
                    viewBox: {
                        type: 'array',
                        items: { type: 'number', minimum: -MAX_MAP_COORDINATE, maximum: MAX_MAP_COORDINATE },
                        minItems: 4,
                        maxItems: 4,
                        description: 'Full-map extent [x,y,width,height], with positive size. New scenes default to [0,0,400,300]; omission preserves an existing extent. Include the whole layout and label margins. Used on scene entry or Fit; updates do not pan/zoom the current user viewport. Do not change it just to move an actor.',
                    },
                    mood: nullableEnum(mood, 'Optional scene atmosphere used for rendering. Use null to clear it.'),
                    elements: {
                        type: 'array',
                        maxItems: MAX_SCENE_ELEMENTS,
                        description: `Element patches addressed by id. Omitted fields of an existing element are preserved. A scene holds at most ${MAX_SCENE_ELEMENTS} elements.`,
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Stable element identity inside this scene.' },
                                cat: { type: 'string', enum: [...MAP_ELEMENT_CATEGORIES], description: 'What the element is. Required for a new id. An existing id keeps its stored category; use another id for a different entity.' },
                                kind: nullableEnum(MAP_ELEMENT_KINDS, 'Optional semantic role, such as a door or the player. Use null to clear it.'),
                                shape: { type: 'string', enum: [...MAP_ELEMENT_SHAPES], description: 'Shape matching the supplied geo; inferred from geo when omitted.' },
                                geo: {
                                    type: 'object',
                                    description: 'Complete geometry for one shape: rect uses center and size; circle uses at and radius; path uses points; curve uses curve; icon and label use at. Required for a new element; replaces the existing geometry when supplied. Omit for rotation-only or material-only edits; to move a rect, retain its size and change its center.',
                                    properties: {
                                        center: { ...coordinatePair, description: 'Rect center [x, y].' },
                                        at: { ...coordinatePair, description: 'Single anchor point [x, y] for circle, icon and label.' },
                                        size: {
                                            type: 'array',
                                            items: { type: 'number', minimum: 0, maximum: MAX_MAP_DIMENSION },
                                            minItems: 2,
                                            maxItems: 2,
                                            description: 'Rect size [width, height]; both must be positive.',
                                        },
                                        radius: { type: 'number', minimum: 0, maximum: MAX_MAP_DIMENSION, description: 'Circle radius; must be strictly positive.' },
                                        points: { ...pointList, description: `Ordered vertices joined by straight segments, 2 to ${MAX_MAP_POINTS}. For routes: start, genuine turns, end. For areas: walk around the perimeter in order, not across it.` },
                                        curve: { ...pointList, description: `Ordered positions the smooth line passes through, 2 to ${MAX_MAP_POINTS}. The renderer computes smoothing between them. For closed areas, trace the perimeter in order; for routes, supply endpoints and meaningful bends only.` },
                                    },
                                    additionalProperties: false,
                                },
                                label: { type: ['string', 'null'], maxLength: MAX_MAP_LABEL_LENGTH, description: 'Short visible text. Required for shape "label". On cat "actor" it is the character\'s displayed name: actorKey is only an internal id and is never shown, so give every new non-player actor its name here. The player\'s name is filled automatically. Use null to clear it.' },
                                actorKey: { type: ['string', 'null'], maxLength: MAX_MAP_ID_LENGTH, description: 'Stable actor identity for a new cat "actor" element. The player is always "player". An existing actor keeps its stored actorKey.' },
                                icon: nullableEnum(MAP_ICON_TOKENS, `Object type or marker symbol. Sized objects use rect/circle footprints; other outlines retain their original shape. On shape icon/label it is only a position marker/text. Actors and entrances retain their marker identity regardless of icon. Use null to clear.\n${objectGuidance}`),
                                material: nullableEnum(MAP_MATERIALS, 'What the surface is made of, independent of object type: e.g. icon table + material metal. Floors, ground, decks and platforms are cat terrain with a surface material; fabric and bed-sheet describe soft objects, not a floor. Textures are automatic. Use null to clear.'),
                                certainty: nullableEnum(MAP_CERTAINTIES, 'Use inferred for ordinary structures you plausibly add beyond explicit setting/story facts. Omit for established facts; approximate coordinates alone are not inferred. Use null to clear.'),
                                closed: { type: ['boolean', 'null'], description: 'Paths/curves only: true joins last to first (needs 3+ points); false stays open. Omit preserves the stored value; null removes the override. Without an override, 3+ points close for water/terrain/furniture/decoration/danger/magic/secret/light; other categories stay open. An open fence needs false even with category decoration. Two points are always a line. Wall boundaries and fence paths never fill their interior.' },
                                rotation: { type: ['number', 'null'], minimum: 0, description: 'Rect/circle only: clockwise degrees [0,360) around the footprint centre. At 0, object fronts and car noses face south; chair/sofa backs and bed heads are north; bridges run north-south. A front facing north is 180, east 270, west 90. Omit preserves; null clears. Clear explicitly when changing to a non-rect/circle shape.' },
                            },
                            required: ['id'], additionalProperties: false,
                        },
                    },
                    remove: {
                        type: 'array',
                        maxItems: MAX_SCENE_ELEMENTS,
                        items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH },
                        description: 'Element ids to delete from this scene. Use only for explicit correction, disappearance, or destruction.',
                    },
                },
                required: ['scene'], additionalProperties: false,
            },
        },
    },
]); }

export const MAP_MAINTENANCE_TOOLS = mapTools('Edits update the draft; the app saves after the run. Returns {ok,status,changed,applied,skipped,warnings,hint?,data?}. status is updated, unchanged (already matches; success), partial or failed.');
