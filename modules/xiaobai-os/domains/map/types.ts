import type { MAP_ICON_TOKENS } from './semantics.js';

export type MapLocationScale = 'world' | 'region' | 'city' | 'district' | 'building' | 'floor' | 'room' | 'outdoor';
export type MapTerrain = 'urban' | 'plain' | 'forest' | 'water' | 'mountain' | 'desert' | 'snow';
export type MapLocationStatus = 'mentioned' | 'visited';
export type MapLinkKind = 'door' | 'stairs' | 'elevator' | 'path' | 'road' | 'portal' | 'passage';
export type MapSceneStatus = 'uninitialized' | 'active';
export type MapSceneMood = 'neutral' | 'warm' | 'cold' | 'dark' | 'mystic' | 'danger' | 'calm';

export type MapElementCategory =
    | 'wall'
    | 'road'
    | 'water'
    | 'terrain'
    | 'furniture'
    | 'decoration'
    | 'door'
    | 'danger'
    | 'marker'
    | 'actor'
    | 'label'
    | 'grid'
    | 'magic'
    | 'secret'
    | 'light';

export type MapElementShape = 'rect' | 'circle' | 'path' | 'curve' | 'icon' | 'label';

/** Closed logic semantics. Visual glyphs live in MapIconToken. */
export type MapElementKind =
    | 'door'
    | 'stairs'
    | 'elevator'
    | 'portal'
    | 'passage'
    | 'entrance'
    | 'exit'
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'up'
    | 'down'
    | 'trap'
    | 'chest'
    | 'marker'
    | 'player'
    | 'actor';

/** Closed material recipes understood by the renderer. */
export type MapMaterial =
    | 'unknown'
    | 'wood'
    | 'stone'
    | 'tile'
    | 'carpet'
    | 'bed-sheet'
    | 'fabric'
    | 'tatami'
    | 'sand'
    | 'marble'
    | 'blood'
    | 'water'
    | 'grass'
    | 'forest'
    | 'glass'
    | 'dirt'
    | 'snow'
    | 'metal'
    | 'rune'
    | 'warm-light'
    | 'cold-light'
    | 'shadow';

/** Local renderer vocabulary; arbitrary SVG, CSS and remote icon names are never persisted. */
export type MapIconToken = (typeof MAP_ICON_TOKENS)[number];

export interface RectGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CircleGeometry {
    x: number;
    y: number;
    radius: number;
}

export interface PointGeometry {
    x: number;
    y: number;
}

export interface PointsGeometry {
    points: Array<[number, number]>;
}

export type MapGeometry = RectGeometry | CircleGeometry | PointGeometry | PointsGeometry;

export interface MapElement {
    id: string;
    category: MapElementCategory;
    shape: MapElementShape;
    geometry: MapGeometry;
    kind?: MapElementKind;
    icon?: MapIconToken;
    label?: string;
    actorKey?: string;
    material?: MapMaterial;
    certainty?: 'confirmed' | 'inferred' | 'unknown';
    closed?: boolean;
    /** Clockwise degrees around a rectangle/circle centre; absent means axis-aligned. */
    rotation?: number;
}

export interface MapScene {
    key: string;
    name: string;
    status: MapSceneStatus;
    viewBox: [number, number, number, number];
    mood?: MapSceneMood;
    elements: MapElement[];
}

export interface MapLocation {
    key: string;
    name: string;
    scale: MapLocationScale;
    status: MapLocationStatus;
    parent?: string;
    sceneKey?: string;
    brief?: string;
    /** Stable map position within the parent region; north is smaller y. Not GPS or distance. */
    position?: [number, number];
    terrain?: MapTerrain;
}

export interface MapLink {
    id: string;
    from: string;
    to: string;
    kind: MapLinkKind;
    label?: string;
    bidirectional: boolean;
}

export interface MapActorPosition {
    actorKey: string;
    displayName: string;
    locationKey: string;
}

export interface MapAtlas {
    locations: MapLocation[];
    links: MapLink[];
    actors: MapActorPosition[];
}

export interface MapDomainV1 {
    schemaVersion: 1;
    revision: number;
    atlas: MapAtlas;
    scenes: Record<string, MapScene>;
}
