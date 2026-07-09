export const TAVERN_MAP_DOC_TYPE = 'tavern.map' as const;
export const TAVERN_MAP_DOC_ID = 'main';
export const TAVERN_MAP_LABEL_PREFIX = '__label__';

export type TavernMapTheme = 'parchment' | 'paper' | 'dark' | 'blueprint' | 'grid';
export type TavernMapStatus = 'uninitialized' | 'active';
export type TavernMapMood = 'neutral' | 'warm' | 'cold' | 'dark' | 'mystic' | 'danger' | 'calm';

export interface TavernSeedMapDocument {
    meta: {
        name: string | null;
        viewBox: [number, number, number, number] | null;
        theme: TavernMapTheme;
        status: TavernMapStatus;
        mood: TavernMapMood;
        hint: string;
    };
    elements: [];
}

export function buildSeedMapHint(): string {
    return [
        'This scene map is empty. Treat maps as files: read `world` with MapAtlasRead, choose an explicit scene name, then initialize this scene with MapSceneEdit.',
        'Indoor MapSceneEdit example: {"scene":"<Place Name>","playerHere":true,"viewBox":[0,0,400,300],"mood":"warm","elements":[{"id":"room-terrain","cat":"terrain","shape":"rect","geo":{"center":[200,150],"size":[320,220]},"material":"wood"},{"id":"wall","cat":"wall","shape":"rect","geo":{"center":[200,150],"size":[320,220]},"material":"stone","label":"<Place Name>"},{"id":"firelight","cat":"light","shape":"circle","geo":{"at":[80,80],"radius":70},"material":"warm-light"},{"id":"door","cat":"door","kind":"door","shape":"icon","geo":{"at":[200,260]},"label":"Door"},{"id":"player-room","cat":"actor","kind":"player","actorKey":"player","shape":"icon","geo":{"at":[200,180]},"label":"Player"}]}',
        'Outdoor MapSceneEdit example: {"scene":"<Place Name>","playerHere":true,"viewBox":[0,0,800,600],"mood":"neutral","elements":[{"id":"ground","cat":"terrain","shape":"circle","geo":{"at":[400,300],"radius":150},"material":"grass"},{"id":"path","cat":"road","shape":"path","geo":{"points":[[0,300],[800,300]]},"material":"dirt"},{"id":"player-road","cat":"actor","kind":"player","actorKey":"player","shape":"icon","geo":{"at":[400,320]},"label":"Player"}]}',
        'Requirement: include at least one spatial geometry element with shape rect, circle, path, curve, or icon. Use only the minimum geo for that one shape; rect uses center+size, not at+size. Do not fill unused geo keys. Labels describe geometry but cannot replace it. If nothing changes spatially, skip the map update.',
        'Scene-map construction order: first define the visible scope and camera, then draw the main continuous scene surface or outer boundary expressively along the real visible shape, then place internal zones, doors, furniture, hazards, objects, labels, and actors relative to that structure.',
        'Closed or contained scenes usually need both a filled main surface (`cat:"terrain"`) and an outer boundary (`cat:"wall"`). Trace enclosing walls, edges, shells, shorelines, clearing edges, and other limits along their true silhouette; use a simple rect only when the boundary is truly simple, and use path or curve whenever the real outline bends, narrows, breaks, or has an organic/irregular shape.',
        'Open scenes are the exception: empty space, open ocean, broad desert, plains, continents, or other unbounded vistas may use a main surface, route, shoreline, orbit lane, or landmark network instead of a closed boundary.',
        'Use MapSceneRead only when you need existing element ids. For connected places, keep editing the same explicit scene name and enlarge `viewBox` when the visible scope needs more room. For clearly separate named locations, use a separate explicit scene name.',
        'Use `kind` for closed map semantics such as door/stairs/elevator/portal/passage/entrance/exit/trap/chest/marker/player/north/south/east/west/up/down. `icon` is only an optional Material Symbols official visual name, lowercase underscores, e.g. door_open, inventory_2, chair, table_bar, single_bed, local_bar, menu_book, science, biotech, swords, local_fire_department, water_drop, skull, park, location_on. Omit icon when unsure; do not invent non-official names such as sword or door.',
        'Use the scene name as the map scope title. Area labels are allowed only when they mark a concrete visible region; place them inside or next to that region, not at the top edge as a second title.',
        '`viewBox` is the camera. Changing it does not move any element. Move the player by updating the player coordinates, then adjust `viewBox` only if the camera should follow.',
        'Elements use `id`, `cat`, one `shape`, `geo`, and optional independent `label`. Put coordinates and dimensions inside `geo`; do not write internal rect/circle/path/curve/icon/text sibling fields.',
        'Use material/mood/certainty only for confirmed semantic facts. Material is a closed enum: unknown/wood/stone/tile/carpet/bed-sheet/fabric/tatami/sand/marble/blood/water/grass/dirt/snow/metal/rune/warm-light/cold-light/shadow. Use terrain for the main continuous scene surface or filled base area: floor, ground, deck, platform, clearing, yard, roadbed, shoreline area, or other large support surface; use light for glow/shadow. Use bed-sheet/fabric only for bedding, upholstery, curtains, cushions, or other furniture/soft goods, not the main terrain surface. Do not use floor/ground/surface/deck/platform/base/area/region/subtype/opacity/custom fill colors or update only for aesthetics.',
    ].join(' ');
}

export function createSeedMapDocument(): TavernSeedMapDocument {
    return {
        meta: {
            name: null,
            viewBox: null,
            theme: 'parchment',
            status: 'uninitialized',
            mood: 'neutral',
            hint: buildSeedMapHint(),
        },
        elements: [],
    };
}

export function isSeedLabelId(value: unknown): boolean {
    return String(value || '').startsWith(TAVERN_MAP_LABEL_PREFIX);
}

export function buildSeedLabelId(id: string): string {
    return `${TAVERN_MAP_LABEL_PREFIX}${id}`;
}

export function isUninitializedMapData(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return false;}
    const meta = (value as { meta?: { status?: unknown } }).meta;
    return meta?.status === 'uninitialized';
}
