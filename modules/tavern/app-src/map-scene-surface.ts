import { compareMapStableText, materialEntry } from '../shared/map-semantics';
import type { TavernMapDocument, TavernMapElement } from '../shared/structured-state';

const DEFAULT_TERRAIN_SURFACE = '#5f754c';
const NON_ROOM_SURFACE_MATERIALS = new Set(['bed-sheet', 'fabric']);

const MATERIAL_SURFACE_BACKGROUNDS: Record<string, string> = {
    wood: 'linear-gradient(90deg, rgba(56, 36, 21, 0.34) 1px, transparent 1px), linear-gradient(0deg, rgba(119, 86, 58, 0.32), rgba(93, 66, 44, 0.92)), #5d422c',
    stone: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 38%), linear-gradient(90deg, rgba(43, 41, 49, 0.36) 1px, transparent 1px), #55505a',
    tile: 'linear-gradient(rgba(32, 35, 45, 0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(32, 35, 45, 0.42) 1px, transparent 1px), #404454',
    carpet: 'radial-gradient(circle at 18% 20%, rgba(240, 199, 124, 0.22), transparent 24%), linear-gradient(135deg, rgba(64, 10, 22, 0.24), transparent 45%), #8d2638',
    tatami: 'linear-gradient(90deg, rgba(42, 38, 32, 0.38) 2px, transparent 2px, transparent 50%, rgba(42, 38, 32, 0.34) 50%, rgba(42, 38, 32, 0.34) calc(50% + 2px), transparent calc(50% + 2px)), repeating-linear-gradient(0deg, rgba(179, 162, 104, 0.55) 0 1px, transparent 1px 4px), #d3c282',
    sand: 'radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.22), transparent 12%), radial-gradient(circle at 74% 70%, rgba(194, 169, 110, 0.22), transparent 18%), linear-gradient(135deg, rgba(211, 189, 132, 0.26), transparent 52%), #ead7a4',
    marble: 'linear-gradient(135deg, rgba(194, 199, 208, 0.34), transparent 18%, rgba(255, 255, 255, 0.38) 45%, transparent 72%), radial-gradient(circle at 22% 16%, rgba(255, 255, 255, 0.62), transparent 26%), #eef0f3',
    blood: 'radial-gradient(circle at 50% 45%, rgba(91, 17, 24, 0.92), rgba(91, 17, 24, 0.62) 52%, rgba(48, 7, 10, 0.86)), #3d080d',
    water: 'linear-gradient(0deg, rgba(189, 233, 238, 0.15) 1px, transparent 1px), radial-gradient(circle at 30% 20%, rgba(170, 229, 237, 0.20), transparent 30%), #2f7990',
    grass: 'radial-gradient(circle at 20% 18%, rgba(124, 164, 95, 0.22), transparent 30%), linear-gradient(135deg, rgba(25, 54, 31, 0.20), transparent 42%), #486d3e',
    dirt: 'radial-gradient(circle at 24% 28%, rgba(155, 118, 81, 0.22), transparent 24%), radial-gradient(circle at 72% 65%, rgba(75, 55, 37, 0.24), transparent 22%), #76583a',
    snow: 'radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.82), transparent 26%), linear-gradient(135deg, rgba(124, 160, 174, 0.18), transparent 48%), #dce8ed',
    metal: 'linear-gradient(135deg, rgba(168, 173, 180, 0.28), transparent 28%, rgba(30, 32, 36, 0.22) 58%, transparent), #62666d',
    rune: 'radial-gradient(circle at 50% 42%, rgba(189, 165, 255, 0.22), transparent 32%), linear-gradient(135deg, rgba(18, 63, 77, 0.26), rgba(68, 51, 94, 0.92)), #44335e',
};

function numberPair(value: unknown): [number, number] | null {
    if (!Array.isArray(value) || value.length < 2) {return null;}
    const left = Number(value[0]);
    const right = Number(value[1]);
    return Number.isFinite(left) && Number.isFinite(right) ? [left, right] : null;
}

function absolutePoints(element: TavernMapElement, points: Array<[number, number]>): Array<[number, number]> {
    return points.map(([dx, dy]) => [element.at[0] + dx, element.at[1] + dy]);
}

function polygonArea(points: Array<[number, number]>): number {
    if (points.length < 3) {return 0;}
    const sum = points.reduce((total, [x, y], index) => {
        const [nextX, nextY] = points[(index + 1) % points.length];
        return total + x * nextY - nextX * y;
    }, 0);
    return Math.abs(sum) / 2;
}

export function getTavernMapSceneSurfaceArea(element: TavernMapElement): number {
    if (String(element.cat || '').trim() !== 'terrain') {return 0;}
    if (NON_ROOM_SURFACE_MATERIALS.has(String(element.material || '').trim())) {return 0;}
    if (materialEntry(element.material)?.layer === 'light') {return 0;}
    const rect = numberPair(element.rect);
    if (rect && rect[0] > 0 && rect[1] > 0) {return rect[0] * rect[1];}
    if (typeof element.circle === 'number' && element.circle > 0) {return Math.PI * element.circle * element.circle;}
    if (element.closed === true && element.path) {return polygonArea(absolutePoints(element, element.path));}
    if (element.closed === true && element.curve) {return polygonArea(absolutePoints(element, element.curve));}
    return 0;
}

export function getTavernMapSceneSurfaceElement(document: TavernMapDocument | null | undefined): TavernMapElement | null {
    const candidates = (document?.elements || [])
        .map((element) => ({ element, area: getTavernMapSceneSurfaceArea(element) }))
        .filter((item) => item.area > 0)
        .sort((left, right) => right.area - left.area || compareMapStableText(left.element.id, right.element.id));
    return candidates[0]?.element || null;
}

export function getTavernMapSceneSurfaceFill(element: TavernMapElement | null | undefined): string {
    if (!element) {return 'none';}
    const material = materialEntry(element.material);
    if (material?.layer === 'fill') {return material.paint;}
    if (element.fill) {return String(element.fill);}
    return DEFAULT_TERRAIN_SURFACE;
}

export function getTavernMapSceneSurfaceOpacity(element: TavernMapElement | null | undefined): number {
    const materialOpacity = materialEntry(element?.material)?.opacity;
    return Math.max(0.9, Math.min(1, Number(materialOpacity ?? 1)));
}

export function getTavernMapSceneSurfaceBackground(element: TavernMapElement | null | undefined): string {
    if (!element) {return '';}
    const material = String(element.material || '').trim();
    if (material && MATERIAL_SURFACE_BACKGROUNDS[material]) {return MATERIAL_SURFACE_BACKGROUNDS[material];}
    if (element.fill && !String(element.fill).includes('url(')) {
        return `linear-gradient(${element.fill}, ${element.fill})`;
    }
    return `linear-gradient(${DEFAULT_TERRAIN_SURFACE}, ${DEFAULT_TERRAIN_SURFACE})`;
}
