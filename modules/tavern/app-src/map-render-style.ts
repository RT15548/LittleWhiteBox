import { canMapElementUseAreaFill, materialEntry } from '../shared/map-semantics';
import type { TavernMapElement } from '../shared/structured-state';

type MapBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay';

export interface TavernMapElementVisualContext {
    surfaceElementId?: string;
    surfaceMaterial?: string;
}

export interface TavernMapLineCasing {
    color: string;
    width: number;
    opacity: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    wall: '#2f2418',
    road: '#c79b5a',
    water: '#72c3d5',
    terrain: '#d4c36e',
    furniture: '#7b5830',
    decoration: '#7b5830',
    door: '#c77735',
    danger: '#d55344',
    marker: '#b94035',
    actor: '#b94035',
    label: '#2b2118',
    grid: '#9f987f',
    magic: '#9a74c4',
    secret: '#756d62',
    light: '#d48a42',
};

const MATERIAL_LINE_COLORS: Record<string, string> = {
    stone: '#7d7682',
    tile: '#788096',
    wood: '#7b5430',
    metal: '#8d949c',
    'bed-sheet': '#b5a89a',
    fabric: '#9c88a8',
    tatami: '#8d7f51',
    sand: '#b79455',
    marble: '#8b92a0',
    grass: '#d4c36e',
    dirt: '#c79b5a',
    water: '#72c3d5',
    snow: '#5c8592',
};

const SAME_SURFACE_FILLS: Record<string, string> = {
    wood: 'rgba(255, 222, 154, 0.16)',
    stone: 'rgba(255, 255, 255, 0.13)',
    tile: 'rgba(176, 192, 216, 0.14)',
    carpet: 'rgba(255, 218, 136, 0.14)',
    'bed-sheet': 'rgba(116, 100, 84, 0.12)',
    fabric: 'rgba(124, 104, 136, 0.14)',
    tatami: 'rgba(68, 60, 38, 0.14)',
    sand: 'rgba(156, 126, 69, 0.16)',
    marble: 'rgba(120, 128, 142, 0.13)',
    blood: 'rgba(255, 119, 95, 0.14)',
    water: 'rgba(216, 250, 255, 0.18)',
    grass: 'rgba(236, 218, 126, 0.17)',
    dirt: 'rgba(244, 207, 146, 0.15)',
    snow: 'rgba(74, 112, 124, 0.13)',
    metal: 'rgba(220, 228, 236, 0.12)',
    rune: 'rgba(210, 188, 255, 0.16)',
};

const SAME_SURFACE_LINE_COLORS: Record<string, string> = {
    'bed-sheet': '#8c7f72',
    fabric: '#d8c3e2',
    tatami: '#6f633d',
    sand: '#8c6d3c',
    marble: '#67707d',
    snow: '#466b78',
};

function categoryOf(element: TavernMapElement): string {
    return String(element.cat || '').trim();
}

function materialOf(element: TavernMapElement | null | undefined): string {
    return String(element?.material || '').trim();
}

function numberPair(value: unknown): [number, number] | null {
    if (!Array.isArray(value) || value.length < 2) {return null;}
    const left = Number(value[0]);
    const right = Number(value[1]);
    return Number.isFinite(left) && Number.isFinite(right) ? [left, right] : null;
}

export function tavernMapElementHasAreaShape(element: TavernMapElement): boolean {
    const rect = numberPair(element.rect);
    if (rect && rect[0] > 0 && rect[1] > 0) {return true;}
    if (typeof element.circle === 'number' && element.circle > 0) {return true;}
    return ((!!element.path || !!element.curve) && element.closed === true);
}

export function tavernMapElementIsSceneSurface(element: TavernMapElement, context: TavernMapElementVisualContext = {}): boolean {
    return !!context.surfaceElementId && element.id === context.surfaceElementId;
}

export function tavernMapElementUsesSameSurfaceMaterial(element: TavernMapElement, context: TavernMapElementVisualContext = {}): boolean {
    const material = materialOf(element);
    return !!material && !!context.surfaceMaterial && material === context.surfaceMaterial;
}

export function tavernMapElementFill(element: TavernMapElement, context: TavernMapElementVisualContext = {}): string {
    if (!canMapElementUseAreaFill(element.cat)) {return element.fill ? String(element.fill) : 'none';}
    const hasArea = tavernMapElementHasAreaShape(element);
    if (!hasArea) {return 'none';}

    const cat = categoryOf(element);
    const material = materialOf(element);
    if (cat === 'terrain' && !tavernMapElementIsSceneSurface(element, context) && tavernMapElementUsesSameSurfaceMaterial(element, context)) {
        return SAME_SURFACE_FILLS[material] || 'rgba(246, 231, 166, 0.15)';
    }

    const materialPaint = materialEntry(element.material);
    if (materialPaint?.layer === 'fill') {return materialPaint.paint;}
    if (element.fill) {return String(element.fill);}

    const fills: Record<string, string> = {
        water: 'rgba(91, 181, 205, 0.34)',
        terrain: 'rgba(210, 196, 112, 0.16)',
        road: 'rgba(188, 135, 70, 0.24)',
        danger: 'rgba(205, 72, 58, 0.20)',
        decoration: 'rgba(120, 88, 45, 0.14)',
        magic: 'rgba(150, 100, 196, 0.20)',
        secret: 'rgba(236, 221, 180, 0.15)',
    };
    return fills[cat] || 'rgba(120, 88, 45, 0.14)';
}

export function tavernMapElementBlend(element: TavernMapElement, context: TavernMapElementVisualContext = {}): MapBlendMode {
    if (categoryOf(element) === 'terrain' && !tavernMapElementIsSceneSurface(element, context) && tavernMapElementUsesSameSurfaceMaterial(element, context)) {
        return 'normal';
    }
    return materialEntry(element.material)?.blend || 'normal';
}

export function tavernMapElementColor(element: TavernMapElement, context: TavernMapElementVisualContext = {}): string {
    if (element.style?.color) {return String(element.style.color);}
    const cat = categoryOf(element);
    const material = materialOf(element);
    if (cat === 'terrain' && !tavernMapElementIsSceneSurface(element, context) && tavernMapElementUsesSameSurfaceMaterial(element, context)) {
        return SAME_SURFACE_LINE_COLORS[material] || '#e5cf7a';
    }
    if (['wall', 'door', 'road', 'water', 'terrain'].includes(cat) && material && MATERIAL_LINE_COLORS[material]) {
        return MATERIAL_LINE_COLORS[material];
    }
    return CATEGORY_COLORS[cat] || CATEGORY_COLORS.wall;
}

export function tavernMapElementStrokeWidth(element: TavernMapElement): number {
    const explicit = Number(element.style?.width || 0);
    const cat = categoryOf(element);
    const hasArea = tavernMapElementHasAreaShape(element);
    const defaults: Record<string, number> = {
        road: hasArea ? 2.6 : 5.6,
        water: hasArea ? 2.4 : 5,
        wall: 3,
        door: 3.2,
        terrain: hasArea ? 2.4 : 2.2,
        furniture: 2.1,
        decoration: 2.1,
        danger: 2.6,
        magic: 2.5,
        secret: 2.4,
    };
    const fallback = defaults[cat] || 2;
    return Number.isFinite(explicit) && explicit > 0 ? Math.max(explicit, fallback) : fallback;
}

export function tavernMapElementLineCasing(element: TavernMapElement): TavernMapLineCasing | null {
    if (tavernMapElementHasAreaShape(element)) {return null;}
    const cat = categoryOf(element);
    const width = tavernMapElementStrokeWidth(element);
    const casings: Record<string, { color: string; extra: number; opacity: number }> = {
        road: { color: 'rgba(52, 34, 20, 0.58)', extra: 3.8, opacity: 0.78 },
        water: { color: 'rgba(16, 64, 78, 0.62)', extra: 3.4, opacity: 0.72 },
        wall: { color: 'rgba(36, 24, 16, 0.52)', extra: 2.6, opacity: 0.7 },
        door: { color: 'rgba(54, 31, 16, 0.48)', extra: 2.4, opacity: 0.66 },
        danger: { color: 'rgba(71, 12, 10, 0.50)', extra: 3, opacity: 0.68 },
        magic: { color: 'rgba(52, 32, 86, 0.48)', extra: 3, opacity: 0.62 },
        secret: { color: 'rgba(44, 37, 29, 0.42)', extra: 2.8, opacity: 0.58 },
    };
    const casing = casings[cat];
    if (!casing) {return null;}
    return {
        color: casing.color,
        width: width + casing.extra,
        opacity: casing.opacity,
    };
}
