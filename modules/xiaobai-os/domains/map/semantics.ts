import type {
    MapElementCategory,
    MapElementKind,
    MapElementShape,
    MapMaterial,
} from './types.js';

export const MAP_ELEMENT_CATEGORIES: readonly MapElementCategory[] = Object.freeze([
    'wall', 'road', 'water', 'terrain', 'furniture', 'decoration', 'door', 'danger', 'marker',
    'actor', 'label', 'grid', 'magic', 'secret', 'light',
]);

export const MAP_ELEMENT_SHAPES: readonly MapElementShape[] = Object.freeze([
    'rect', 'circle', 'path', 'curve', 'icon', 'label',
]);

export const MAP_ELEMENT_KINDS: readonly MapElementKind[] = Object.freeze([
    'door', 'stairs', 'elevator', 'portal', 'passage', 'entrance', 'exit', 'north', 'south',
    'east', 'west', 'up', 'down', 'trap', 'chest', 'marker', 'player', 'actor',
]);

export const MAP_MATERIALS: readonly MapMaterial[] = Object.freeze([
    'unknown', 'wood', 'stone', 'tile', 'carpet', 'bed-sheet', 'fabric', 'tatami', 'sand',
    'marble', 'blood', 'water', 'grass', 'forest', 'glass', 'dirt', 'snow', 'metal', 'rune', 'warm-light',
    'cold-light', 'shadow',
]);

export const MAP_CERTAINTIES = Object.freeze(['confirmed', 'inferred', 'unknown'] as const);

/** Object vocabulary shared by tool guidance and sized-object recognition, not rendering assets. */
export const MAP_OBJECT_GROUPS = Object.freeze([
    { name: 'Seating and sleeping', icons: ['chair', 'stool', 'bench', 'sofa', 'bed'], hint: 'chair has a back; stool has none; bench is a long shared seat.' },
    { name: 'Surfaces and storage', icons: ['table', 'counter', 'shelf', 'cabinet', 'chest', 'barrel'], hint: 'shelf is open shelving; cabinet is closed storage; chest is a box; barrel covers barrels and jars.' },
    { name: 'Kitchen and bathroom', icons: ['stove', 'refrigerator', 'sink', 'toilet', 'bathtub'], hint: '' },
    { name: 'Equipment and vehicles', icons: ['terminal', 'machine', 'vending-machine', 'car'], hint: 'terminal is an operator console; machine is general machinery.' },
    { name: 'Site fixtures', icons: ['column', 'partition', 'fence', 'door-open', 'ladder', 'statue', 'well', 'fountain', 'bridge', 'tent'], hint: 'partition is a freestanding screen; fence follows a path; door-open is an entrance marker, not evidence of an open door; ladder is a standalone ladder, not stairs or a floor connection.' },
    { name: 'Plants and natural objects', icons: ['tree', 'potted-plant', 'rock'], hint: 'tree is one tree; a forest is terrain with material forest.' },
    { name: 'Lighting and signs', icons: ['light', 'fire', 'flag', 'sign'], hint: 'light is a freestanding fixture; light regions use category light without an object icon.' },
] as const);
export type MapObjectIcon = (typeof MAP_OBJECT_GROUPS)[number]['icons'][number];
export const MAP_OBJECT_ICONS: readonly MapObjectIcon[] = Object.freeze(MAP_OBJECT_GROUPS.flatMap(group => [...group.icons] as MapObjectIcon[]));
export const MAP_ICON_TOKENS = Object.freeze([
    ...MAP_OBJECT_ICONS,
    'stairs', 'elevator', 'portal', 'passage', 'entrance', 'exit', 'north', 'south',
    'east', 'west', 'up', 'down', 'trap', 'marker', 'player', 'actor', 'building', 'water',
] as const);

export const MAP_TERRAIN_CATEGORY_ALIASES = Object.freeze(new Set([
    'floor', 'ground', 'surface', 'base', 'area', 'deck', 'platform', 'walkway', 'clearing', 'yard',
]));
