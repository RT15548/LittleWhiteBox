import type { TavernMapDocument, TavernMapElement } from '../shared/structured-state';
import { materialEntry } from '../shared/map-semantics';
import { TAVERN_MAP_MATERIAL_SYMBOL_SIZE } from '../shared/map-material-symbols';

export interface TavernMapBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

export interface TavernMapPresentationTransform {
    sourceViewBox: [number, number, number, number];
    viewBox: [number, number, number, number];
    centerX: number;
    centerY: number;
    scale: number;
}

export const DEFAULT_TAVERN_MAP_VIEWBOX: [number, number, number, number] = [0, 0, 800, 600];

const DEFAULT_PADDING = 48;
const MIN_VIEWBOX_SIZE = 160;
const LIGHT_SOURCE_BOUNDS_PADDING = 4;
const PRESENTATION_VIEWBOX_SCALE = 2;

function createBounds(minX: number, minY: number, maxX: number, maxY: number): TavernMapBounds | null {
    if (![minX, minY, maxX, maxY].every((value) => Number.isFinite(value))) {return null;}
    const left = Math.min(minX, maxX);
    const right = Math.max(minX, maxX);
    const top = Math.min(minY, maxY);
    const bottom = Math.max(minY, maxY);
    return {
        minX: left,
        minY: top,
        maxX: right,
        maxY: bottom,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
    };
}

function unionBounds(left: TavernMapBounds | null, right: TavernMapBounds | null): TavernMapBounds | null {
    if (!left) {return right;}
    if (!right) {return left;}
    return createBounds(
        Math.min(left.minX, right.minX),
        Math.min(left.minY, right.minY),
        Math.max(left.maxX, right.maxX),
        Math.max(left.maxY, right.maxY),
    );
}

function expandBounds(bounds: TavernMapBounds, amount: number): TavernMapBounds {
    return createBounds(
        bounds.minX - amount,
        bounds.minY - amount,
        bounds.maxX + amount,
        bounds.maxY + amount,
    ) || bounds;
}

function absolutePoints(element: TavernMapElement, points: Array<[number, number]>): Array<[number, number]> {
    return points.map(([dx, dy]) => [element.at[0] + dx, element.at[1] + dy]);
}

function pointsBounds(points: Array<[number, number]>): TavernMapBounds | null {
    if (!Array.isArray(points) || !points.length) {return null;}
    return points.reduce<TavernMapBounds | null>((bounds, [x, y]) => {
        const pointBounds = createBounds(x, y, x, y);
        return unionBounds(bounds, pointBounds);
    }, null);
}

function rectBounds(element: TavernMapElement): TavernMapBounds | null {
    if (!element.rect) {return null;}
    return createBounds(
        element.at[0],
        element.at[1],
        element.at[0] + element.rect[0],
        element.at[1] + element.rect[1],
    );
}

function circleBounds(element: TavernMapElement): TavernMapBounds | null {
    if (typeof element.circle !== 'number' || element.circle <= 0) {return null;}
    return createBounds(
        element.at[0] - element.circle,
        element.at[1] - element.circle,
        element.at[0] + element.circle,
        element.at[1] + element.circle,
    );
}

function iconBounds(element: TavernMapElement): TavernMapBounds | null {
    if (element.shape !== 'icon' && !element.icon) {return null;}
    const half = TAVERN_MAP_MATERIAL_SYMBOL_SIZE / 2;
    return createBounds(element.at[0] - half, element.at[1] - half, element.at[0] + half, element.at[1] + half);
}

function textBounds(element: TavernMapElement): TavernMapBounds | null {
    if (!element.text) {return null;}
    const width = Math.max(12, element.text.length * 8.4);
    return createBounds(element.at[0] - width / 2, element.at[1] - 14, element.at[0] + width / 2, element.at[1] + 6);
}

function strokePadding(element: TavernMapElement): number {
    const width = Number(element.style?.width || 2);
    return Math.max(4, Number.isFinite(width) && width > 0 ? width / 2 + 4 : 4);
}

export function normalizeTavernMapViewBox(value: unknown): [number, number, number, number] {
    if (!Array.isArray(value) || value.length !== 4) {return [...DEFAULT_TAVERN_MAP_VIEWBOX];}
    const numbers = value.map((item) => Number(item));
    if (!numbers.every((item) => Number.isFinite(item))) {return [...DEFAULT_TAVERN_MAP_VIEWBOX];}
    return [numbers[0], numbers[1], Math.max(1, numbers[2]), Math.max(1, numbers[3])];
}

export function getTavernMapElementBounds(element: TavernMapElement): TavernMapBounds | null {
    if (element.cat === 'light' || materialEntry(element.material)?.layer === 'light') {
        return expandBounds(createBounds(element.at[0], element.at[1], element.at[0], element.at[1]) || {
            minX: element.at[0],
            minY: element.at[1],
            maxX: element.at[0],
            maxY: element.at[1],
            width: 0,
            height: 0,
        }, LIGHT_SOURCE_BOUNDS_PADDING);
    }
    let bounds: TavernMapBounds | null = null;
    if (element.rect) {
        bounds = rectBounds(element);
    } else if (typeof element.circle === 'number') {
        bounds = circleBounds(element);
    } else if (element.path) {
        bounds = pointsBounds(absolutePoints(element, element.path));
    } else if (element.curve) {
        bounds = pointsBounds(absolutePoints(element, element.curve));
    } else if (element.shape === 'icon' || element.icon) {
        bounds = iconBounds(element);
    } else if (element.text) {
        bounds = textBounds(element);
    }
    return bounds ? expandBounds(bounds, strokePadding(element)) : null;
}

export function getTavernMapDocumentBounds(document: TavernMapDocument | null | undefined): TavernMapBounds | null {
    if (!document?.elements?.length) {return null;}
    return document.elements.reduce<TavernMapBounds | null>((combined, element) => (
        unionBounds(combined, getTavernMapElementBounds(element))
    ), null);
}

function matchAspectRatio(bounds: TavernMapBounds, aspectRatio: number): TavernMapBounds {
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {return bounds;}
    const width = Math.max(bounds.width, 1);
    const height = Math.max(bounds.height, 1);
    const currentRatio = width / height;
    if (Math.abs(currentRatio - aspectRatio) < 0.01) {return bounds;}
    if (currentRatio > aspectRatio) {
        const targetHeight = width / aspectRatio;
        const extra = (targetHeight - height) / 2;
        return createBounds(bounds.minX, bounds.minY - extra, bounds.maxX, bounds.maxY + extra) || bounds;
    }
    const targetWidth = height * aspectRatio;
    const extra = (targetWidth - width) / 2;
    return createBounds(bounds.minX - extra, bounds.minY, bounds.maxX + extra, bounds.maxY) || bounds;
}

function ensureMinimumSize(bounds: TavernMapBounds, aspectRatio: number): TavernMapBounds {
    const minWidth = aspectRatio >= 1 ? MIN_VIEWBOX_SIZE : MIN_VIEWBOX_SIZE * aspectRatio;
    const minHeight = aspectRatio >= 1 ? MIN_VIEWBOX_SIZE / aspectRatio : MIN_VIEWBOX_SIZE;
    let next = bounds;
    if (next.width < minWidth) {
        const extra = (minWidth - next.width) / 2;
        next = createBounds(next.minX - extra, next.minY, next.maxX + extra, next.maxY) || next;
    }
    if (next.height < minHeight) {
        const extra = (minHeight - next.height) / 2;
        next = createBounds(next.minX, next.minY - extra, next.maxX, next.maxY + extra) || next;
    }
    return next;
}

function fittedBounds(document: TavernMapDocument | null | undefined, aspectRatio: number): [number, number, number, number] {
    const contentBounds = getTavernMapDocumentBounds(document);
    if (!contentBounds) {return [...DEFAULT_TAVERN_MAP_VIEWBOX];}
    const padded = expandBounds(contentBounds, DEFAULT_PADDING);
    const fitted = ensureMinimumSize(matchAspectRatio(padded, aspectRatio), aspectRatio);
    return [
        Number(fitted.minX.toFixed(2)),
        Number(fitted.minY.toFixed(2)),
        Number(fitted.width.toFixed(2)),
        Number(fitted.height.toFixed(2)),
    ];
}

export function getTavernMapDisplayViewBox(document: TavernMapDocument | null | undefined): [number, number, number, number] {
    if (document?.meta?.viewBox) {
        return normalizeTavernMapViewBox(document.meta.viewBox);
    }
    const fallback = DEFAULT_TAVERN_MAP_VIEWBOX[2] / DEFAULT_TAVERN_MAP_VIEWBOX[3];
    return fittedBounds(document, fallback);
}

export function getTavernMapPresentationTransform(document: TavernMapDocument | null | undefined): TavernMapPresentationTransform {
    const [x, y, width, height] = getTavernMapDisplayViewBox(document);
    const scale = PRESENTATION_VIEWBOX_SCALE;
    const nextWidth = width * scale;
    const nextHeight = height * scale;
    const viewBox: [number, number, number, number] = [
        Number((x - (nextWidth - width) / 2).toFixed(2)),
        Number((y - (nextHeight - height) / 2).toFixed(2)),
        Number(nextWidth.toFixed(2)),
        Number(nextHeight.toFixed(2)),
    ];
    return {
        sourceViewBox: [x, y, width, height],
        viewBox,
        centerX: x + width / 2,
        centerY: y + height / 2,
        scale,
    };
}

export function getTavernMapPresentationViewBox(document: TavernMapDocument | null | undefined): [number, number, number, number] {
    return getTavernMapPresentationTransform(document).viewBox;
}

export function projectTavernMapPresentationPoint(
    point: [number, number],
    transform: TavernMapPresentationTransform,
): [number, number] {
    return [
        Number((transform.centerX + (point[0] - transform.centerX) * transform.scale).toFixed(2)),
        Number((transform.centerY + (point[1] - transform.centerY) * transform.scale).toFixed(2)),
    ];
}
