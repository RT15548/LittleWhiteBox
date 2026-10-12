import type { MapMaterial } from '../../../domains/map/types.js';

/** Material colours are semantic recipes, not per-scene overrides. CSS supplies the night tint. */
export const SCENE_MATERIAL_COLORS: Readonly<Record<MapMaterial, string>> = Object.freeze({
    unknown: '#bfc5b6', wood: '#c4a477', stone: '#bac0ad', tile: '#ccd2bf', carpet: '#b49d91',
    'bed-sheet': '#e0dcca', fabric: '#acb69e', tatami: '#bebd8f', sand: '#ded0a1', marble: '#dce0d3',
    blood: '#ab6260', water: '#86bdb9', grass: '#c7d4ae', forest: '#91ac7d', glass: '#b5d5ce',
    dirt: '#bda989', snow: '#e6eee1', metal: '#aabec0', rune: '#aca0be',
    'warm-light': '#e3c28c', 'cold-light': '#afced6', shadow: '#758079',
    flesh: '#aa657e', slime: '#6dbfa4',
});

export function materialPaint(material: MapMaterial | undefined, prefix: string): string {
    return `url(#${prefix}-material-${material || 'unknown'})`;
}

export function materialFace(material: MapMaterial | undefined, prefix: string): string {
    return `url(#${prefix}-face-${material || 'unknown'})`;
}

export function materialBase(material: MapMaterial): string {
    return `color-mix(in srgb, ${SCENE_MATERIAL_COLORS[material]}, var(--map-surface) var(--scene-material-mix))`;
}
