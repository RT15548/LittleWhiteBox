import {
    canonicalMaterialSymbolName,
    normalizeMaterialSymbolName,
    type MaterialSymbolName,
} from './material-symbols';

export const TAVERN_MAP_MATERIAL_SYMBOL_SIZE = 24;

export const TAVERN_MAP_ELEMENT_KINDS = [
    'door',
    'stairs',
    'elevator',
    'portal',
    'passage',
    'entrance',
    'exit',
    'north',
    'south',
    'east',
    'west',
    'up',
    'down',
    'trap',
    'chest',
    'marker',
    'player',
    'actor',
] as const;

export type TavernMapElementKind = typeof TAVERN_MAP_ELEMENT_KINDS[number];

const MAP_ELEMENT_KIND_SET = new Set<string>(TAVERN_MAP_ELEMENT_KINDS);
const MAP_EXIT_KINDS = new Set<TavernMapElementKind>([
    'door',
    'stairs',
    'elevator',
    'portal',
    'passage',
    'entrance',
    'exit',
    'north',
    'south',
    'east',
    'west',
    'up',
    'down',
]);

const MAP_KIND_SYMBOLS: Record<TavernMapElementKind, MaterialSymbolName> = {
    door: 'door_open',
    stairs: 'stairs',
    elevator: 'elevator',
    portal: 'captive_portal',
    passage: 'conversion_path',
    entrance: 'login',
    exit: 'exit_to_app',
    north: 'north',
    south: 'south',
    east: 'east',
    west: 'west',
    up: 'arrow_upward',
    down: 'arrow_downward',
    trap: 'warning',
    chest: 'inventory_2',
    marker: 'location_on',
    player: 'person_pin_circle',
    actor: 'person',
};

const MAP_CATEGORY_SYMBOLS: Record<string, MaterialSymbolName> = {
    actor: 'person',
    decoration: 'category',
    danger: 'warning',
    door: 'door_open',
    furniture: 'chair',
    grid: 'grid_on',
    label: 'label',
    light: 'lightbulb',
    magic: 'auto_awesome',
    marker: 'location_on',
    road: 'route',
    secret: 'visibility_off',
    terrain: 'terrain',
    wall: 'meeting_room',
    water: 'water_drop',
};

const ATLAS_SCALE_SYMBOLS: Record<string, MaterialSymbolName> = {
    city: 'location_city',
    district: 'apartment',
    building: 'home_work',
    floor: 'stairs',
    room: 'meeting_room',
    outdoor: 'park',
};

function normalizeMapKindText(value: unknown): string {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function normalizeMapElementKind(value: unknown): TavernMapElementKind | undefined {
    const text = normalizeMapKindText(value);
    return MAP_ELEMENT_KIND_SET.has(text) ? text as TavernMapElementKind : undefined;
}

export function isMapExitKind(value: unknown): boolean {
    const kind = normalizeMapElementKind(value);
    return !!kind && MAP_EXIT_KINDS.has(kind);
}

export function isMapExitSemantic(cat: unknown, kind: unknown): boolean {
    return String(cat || '').trim() === 'door' || isMapExitKind(kind);
}

export function resolveMapElementIconName(
    value: unknown,
    context: { kind?: unknown; cat?: unknown; actorKey?: unknown } = {},
): MaterialSymbolName {
    const icon = canonicalMaterialSymbolName(value);
    if (icon) {return icon;}
    const kind = normalizeMapElementKind(context.kind);
    if (kind) {return MAP_KIND_SYMBOLS[kind];}
    if (String(context.cat || '').trim() === 'actor') {
        const actorKey = normalizeMaterialSymbolName(context.actorKey);
        return actorKey === 'player' || actorKey === 'user' ? 'person_pin_circle' : 'person';
    }
    return MAP_CATEGORY_SYMBOLS[String(context.cat || '').trim()] || 'location_on';
}

export function resolveAtlasScaleIconName(scale: unknown): MaterialSymbolName {
    return ATLAS_SCALE_SYMBOLS[String(scale || '').trim()] || 'map';
}
