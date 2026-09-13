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

const EDIT_RESULT_SHAPE = 'Returns {ok, status, changed, applied[], skipped[], warnings[]}. status is updated, unchanged (nothing needed to change; this is success, not a failure to retry), partial or failed. Each skipped item carries collection, index, id, reason and a hint; fix only those and keep the applied ones. warnings list values that were ignored or normalized.';

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

export const MAP_MAINTENANCE_TOOLS: readonly MaintenanceFunctionDeclaration[] = Object.freeze([
    {
        type: 'function',
        function: {
            name: MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ,
            description: [
                'Read the world atlas: locations, links and actor positions. The atlas is normally injected at the start of the run; use this when it was too large to inline or to confirm a key.',
                `Default summary returns counts and the player position. Collection modes are paged (default ${DEFAULT_ATLAS_READ_LIMIT}, at most ${MAX_ATLAS_READ_LIMIT} per page); document returns everything at once.`,
                'Locations carry hasScene, which tells you whether MapSceneRead has a layout to return for that key.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    mode: { type: 'string', enum: ['summary', 'document', 'locations', 'links', 'actors'], description: 'Default summary. Collection modes are paged.' },
                    query: { type: 'string', maxLength: MAX_ATLAS_QUERY_LENGTH, description: 'Case-insensitive text filter for the selected collection.' },
                    parent: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional exact parent key filter for locations.' },
                    status: { type: 'string', enum: locationStatus, description: 'Optional location status filter.' },
                    from: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional endpoint filter for links.' },
                    to: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional other-endpoint filter for links.' },
                    kind: { type: 'string', enum: linkKind, description: 'Optional link kind filter.' },
                    actorKey: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Optional exact actor key filter.' },
                    limit: { type: 'integer', minimum: 1, maximum: MAX_ATLAS_READ_LIMIT, description: `Page size; default ${DEFAULT_ATLAS_READ_LIMIT}.` },
                    offset: { type: 'integer', minimum: 0, description: 'Zero-based page offset.' },
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
                'Upsert locations, links and world-level actor positions, or remove them. Location keys are stable identities. Scene links are created by MapSceneEdit and are not accepted here.',
                'Omit a link id for the stable endpoint/kind-derived id. Bidirectional defaults true.',
                'Removal is for explicit correction or destruction, never merely because an actor left a place.',
                EDIT_RESULT_SHAPE,
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    locations: {
                        type: 'array',
                        maxItems: MAX_MAP_LOCATIONS,
                        description: `Upsert setting-authored or coherently created places, including unvisited destinations. Parents may appear anywhere in the same call. The atlas holds at most ${MAX_MAP_LOCATIONS} locations.`,
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
                                    description: 'Existing or same-call parent location key. Use null to move the location to the Atlas root.',
                                },
                                brief: { type: 'string', maxLength: MAX_MAP_BRIEF_LENGTH, description: 'Short in-world description: what distinguishes this place and why someone might visit. Do not invent events that already happened.' },
                                position: { ...coordinatePair, type: ['array', 'null'], description: 'Use null to clear. Stable [x,y] map position inside the parent region (root places share the world plane). North is smaller y. Use roughly 0..1000 with 160+ separation; follow authored directions, otherwise establish plausible geography. Preserve existing positions.' },
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
                        description: 'Explicit correction/destruction only. Location removal cascades through descendants and owned Map data.',
                        properties: {
                            locationKeys: { type: 'array', maxItems: MAX_MAP_LOCATIONS, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
                            linkIds: { type: 'array', maxItems: MAX_MAP_LINKS, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
                            actorKeys: { type: 'array', maxItems: MAX_MAP_ACTORS, items: { type: 'string', maxLength: MAX_MAP_ID_LENGTH } },
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
                'Read one scene layout to assess its completeness or get its current elements and their ids before patching it.',
                'The key is the same value passed as MapSceneEdit.scene: the location key that owns the scene.',
                'Returns data.scene as editable {scene,title,viewBox,mood?,elements} in exactly the vocabulary MapSceneEdit accepts, including rect center+size. A location without a scene returns null. Location scale and visit status belong to the atlas, not this layout.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    scene: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Scene key or owning location key.' },
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
                'Create or patch one scene layout. It creates and links the owning atlas location itself.',
                'Existing elements are patched by id: omitted fields are preserved and null clears optional fields. Category and actor identity are stable. A supplied geo replaces the whole geometry. To move a rect keep its size and change its center; to rotate or change material send no geo.',
                `New elements need cat and complete valid geo. Elements you do not send are untouched. Use remove for explicit element deletion. A scene holds at most ${MAX_SCENE_ELEMENTS} elements.`,
                'Give one shape and the geo it needs: rect={center,size}; circle={at,radius}; path={points}; curve={curve}; icon={at}; label={at}+label.',
                EDIT_RESULT_SHAPE,
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    scene: {
                        type: 'string',
                        maxLength: MAX_MAP_ID_LENGTH,
                        description: 'Stable scene key, or the location key that owns the scene. Reused on every later edit of the same place.',
                    },
                    title: {
                        type: 'string',
                        maxLength: MAX_MAP_NAME_LENGTH,
                        description: 'Display name of the place. Defaults to the existing name, or to the scene key for a new place.',
                    },
                    scale: { type: 'string', enum: ['city', 'district', 'building', 'floor', 'room', 'outdoor'], description: 'Concrete scene scale; default room. Use the world atlas for worlds and regions.' },
                    status: { type: 'string', enum: locationStatus, description: 'Confirmed discovery state. Preserves an existing value; a new place defaults to mentioned unless the player is placed here, which makes it visited.' },
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
                        description: 'Element patches addressed by id. For an existing id, omitted fields are preserved; for a new id, send cat and complete geometry.',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', maxLength: MAX_MAP_ID_LENGTH, description: 'Stable element identity inside this scene.' },
                                cat: { type: 'string', enum: [...MAP_ELEMENT_CATEGORIES], description: 'What the element is. Required for a new id. An existing id keeps its stored category; use another id for a different entity.' },
                                kind: nullableEnum(MAP_ELEMENT_KINDS, 'Optional semantic role, such as a door or the player. Use null to clear it.'),
                                shape: { type: 'string', enum: [...MAP_ELEMENT_SHAPES], description: 'Optional. Inferred from geo when omitted; a shape that does not match its geo is corrected to the inferred one.' },
                                geo: {
                                    type: 'object',
                                    description: 'Geometry for the chosen shape. Send only the keys that shape needs.',
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
                                        curve: { ...pointList, description: `Ordered positions the smooth line actually passes through, 2 to ${MAX_MAP_POINTS}, NOT Bezier control handles. The renderer computes smoothing. For closed areas, trace the perimeter in order; for routes, supply endpoints and meaningful bends only.` },
                                    },
                                    additionalProperties: false,
                                },
                                label: { type: ['string', 'null'], maxLength: MAX_MAP_LABEL_LENGTH, description: 'Optional short visible text. Required for shape "label". Use null to clear it.' },
                                actorKey: { type: ['string', 'null'], maxLength: MAX_MAP_ID_LENGTH, description: 'Stable actor identity for a new cat "actor" element. The player is always "player". An existing actor keeps its stored actorKey.' },
                                icon: nullableEnum(MAP_ICON_TOKENS, `Object type or marker symbol. Sized objects use rect/circle footprints; other outlines retain their original shape. On shape icon/label it is only a position marker/text. Actors and entrances retain their marker identity regardless of icon. Use null to clear.\n${objectGuidance}`),
                                material: nullableEnum(MAP_MATERIALS, 'What the surface is made of, independent of object type: e.g. icon table + material metal. Floors, ground, decks and platforms are cat terrain with a surface material; fabric and bed-sheet describe soft objects, not a floor. Textures are automatic. Use null to clear.'),
                                certainty: nullableEnum(MAP_CERTAINTIES, 'Use inferred for ordinary structures you plausibly add beyond explicit setting/story facts. Omit for established facts; approximate coordinates alone are not inferred. Use null to clear.'),
                                closed: { type: ['boolean', 'null'], description: 'Paths/curves only: true joins last to first (needs 3+ points); false stays open. Omit preserves the stored value; null removes the override. Without an override, 3+ points close for water/terrain/furniture/decoration/danger/magic/secret/light; other categories stay open. An open fence needs false even with category decoration. Two points are always a line. Wall boundaries and fence paths never fill their interior.' },
                                rotation: { type: ['number', 'null'], minimum: 0, description: 'Rect/circle only: clockwise degrees [0,360) around the footprint centre. At 0, object fronts and car noses face south; chair/sofa backs and bed heads are north; bridges run north-south. A front facing north is 180, east 270, west 90. Omit preserves; null clears. Clear explicitly when changing to a non-rect/circle shape. Rotation-only edits need no geo.' },
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
]);
