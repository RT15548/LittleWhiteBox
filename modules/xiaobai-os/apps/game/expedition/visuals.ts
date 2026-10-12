import type { Relic } from './types.js';
import { RELIC_SPECS, type RelicFamily } from './relics.js';
import { LAND } from './presentation/world-palette.js';

export const CAMERA_EIGHTH_TURNS = 1;
export const WORLD_CAMERA = { height: 23, distance: 25, lead: 5, minimumWidth: 42, mobileWidth: 26, tallSpan: 28, shortSpan: 19, settlementScale: .88 } as const;
export const BEACON_CRITICAL_HP = 30;
export const DEFENSE_COLORS = { ward: '#75c7eb', edge: '#e5f6ff', block: '#dcc08a', parry: '#fff2c9', enamel: '#42647c', silver: '#e4e7df' } as const;
export const CONTRACT_COLORS = { familiar: '#8cc9bc', empowered: '#f1d89e', crest: '#9daedc', page: '#f2ecda', cover: '#4d5876' } as const;

/** Presentation only. Combat distances, damage and rewards never depend on this palette. */
export const PALETTES = [
    { sky: LAND.sky, haze: LAND.haze, stone: LAND.stone, light: LAND.light, floor: LAND.grass, tile: LAND.grassLight, seam: LAND.mortar, dark: LAND.shadow, trim: LAND.brass, accent: LAND.ember, foliage: LAND.leaf, flower: LAND.rose, water: LAND.water },
    { sky: '#bfcfe9', haze: '#dde5f5', stone: '#dce3ed', light: '#f4f1ff', floor: '#abb6cb', tile: '#b2bcd0', seam: '#93a1bb', dark: '#364869', trim: '#c4bcdf', accent: '#9cbeff', foliage: '#626ca0', flower: '#e0b2dd', water: '#88a0bc' },
    { sky: '#f3d8b0', haze: '#fbebd2', stone: '#f0ddba', light: '#fff4da', floor: '#c9bda5', tile: '#cfc3ac', seam: '#b6a88f', dark: '#5a565d', trim: '#c99249', accent: '#ffd481', foliage: '#b87056', flower: '#ffe2a3', water: '#a6b8b0' },
    { sky: '#e0c6bb', haze: '#f0dccc', stone: '#bfada1', light: '#eee3ce', floor: '#a9a1a0', tile: '#b4aaa5', seam: '#88878c', dark: '#3e4a55', trim: '#c18c59', accent: '#ffb06d', foliage: '#8a634b', flower: '#ffd6a5', water: '#c77446' },
    { sky: '#c1e4f1', haze: '#e0f4f8', stone: '#d7e9ed', light: '#f6ffff', floor: '#a7c5d2', tile: '#b0cfd9', seam: '#8dabbc', dark: '#365773', trim: '#afcdd9', accent: '#9ce4f0', foliage: '#6395ad', flower: '#edf5ff', water: '#599aba' },
    { sky: '#c9c1e6', haze: '#e5dff5', stone: '#ddd6ec', light: '#f8f3ff', floor: '#b8b0ce', tile: '#c4bcd9', seam: '#9f95b5', dark: '#44395e', trim: '#d5ba8e', accent: '#c6aff9', foliage: '#766a9f', flower: '#eadba9', water: '#9482bb' },
] as const;
export type Palette = typeof PALETTES[number];
const FAMILY_TINT: Record<RelicFamily, string> = {
    storm: '#428dad', fire: '#b96839', frost: '#558eaf', guard: '#4e8776', life: '#ad5261', skill: '#8170ac', risk: '#a54853',
    blade: '#a98243', bow: '#498362', staff: '#8170ac', daggers: '#a95176', grimoire: '#578476', cannon: '#987347',
};
export const RELIC_TINT = Object.fromEntries(Object.entries(RELIC_SPECS).map(([id, spec]) => [id, FAMILY_TINT[spec.family]])) as Record<Relic, string>;
