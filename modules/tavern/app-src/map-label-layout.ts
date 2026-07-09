export interface TavernMapLabelBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

export interface TavernMapLabelLayoutItem {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    anchor?: string;
}

export interface TavernMapLabelLayoutOptions<T extends TavernMapLabelLayoutItem> {
    priority?: (item: T) => number;
}

const LABEL_PADDING_X = 8;
const LABEL_PADDING_Y = 4;
const OVERLAP_WEIGHT = 10_000;
const DISTANCE_WEIGHT = 0.12;

interface TavernMapLabelPlacement {
    x: number;
    y: number;
    bounds: TavernMapLabelBounds;
}

function isCjkLike(char: string) {
    return /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/u.test(char);
}

function labelTextUnits(text = '') {
    return [...String(text || '')].reduce((sum, char) => {
        if (isCjkLike(char)) {return sum + 1;}
        if (/\s/u.test(char)) {return sum + 0.35;}
        if (/[\x00-\x7f]/u.test(char)) {return sum + 0.56;}
        return sum + 0.78;
    }, 0);
}

export function estimateTavernMapLabelBounds(item: TavernMapLabelLayoutItem, x = item.x, y = item.y): TavernMapLabelBounds {
    const fontSize = Math.max(8, Number(item.fontSize || 14));
    const textWidth = Math.max(fontSize, labelTextUnits(item.text) * fontSize);
    const width = textWidth + LABEL_PADDING_X * 2;
    const height = fontSize * 1.35 + LABEL_PADDING_Y * 2;
    const anchor = String(item.anchor || 'middle').toLowerCase();
    const minX = anchor === 'start'
        ? x - LABEL_PADDING_X
        : anchor === 'end'
            ? x - width + LABEL_PADDING_X
            : x - width / 2;
    const maxX = minX + width;
    const maxY = y + LABEL_PADDING_Y;
    const minY = maxY - height;
    return { minX, minY, maxX, maxY, width, height };
}

function overlapArea(left: TavernMapLabelBounds, right: TavernMapLabelBounds) {
    const width = Math.max(0, Math.min(left.maxX, right.maxX) - Math.max(left.minX, right.minX));
    const height = Math.max(0, Math.min(left.maxY, right.maxY) - Math.max(left.minY, right.minY));
    return width * height;
}

function labelCandidateOffsets(bounds: TavernMapLabelBounds): Array<[number, number]> {
    const side = Math.max(16, Math.min(42, bounds.height * 1.45));
    const vertical = Math.max(14, Math.min(32, bounds.height * 1.08));
    return [
        [0, 0],
        [0, -vertical],
        [0, vertical],
        [side, -vertical * 0.72],
        [side, vertical * 0.72],
        [-side, -vertical * 0.72],
        [-side, vertical * 0.72],
        [side, 0],
        [-side, 0],
    ];
}

function compareStableText(left = '', right = '') {
    const a = String(left);
    const b = String(right);
    return a < b ? -1 : a > b ? 1 : 0;
}

export function layoutTavernMapLabels<T extends TavernMapLabelLayoutItem>(
    items: readonly T[],
    viewBox: [number, number, number, number],
    options: TavernMapLabelLayoutOptions<T> = {},
): T[] {
    if (!items.length) {return [];}
    void viewBox;
    const placements = new Map<number, TavernMapLabelPlacement>();
    const placedBounds: TavernMapLabelBounds[] = [];
    const indexed = items.map((item, index) => ({ item, index }));
    indexed.sort((left, right) => {
        const leftPriority = options.priority?.(left.item) ?? 50;
        const rightPriority = options.priority?.(right.item) ?? 50;
        return leftPriority - rightPriority
            || compareStableText(left.item.id, right.item.id)
            || left.index - right.index;
    });

    indexed.forEach(({ item, index }) => {
        const baseBounds = estimateTavernMapLabelBounds(item);
        const basePlacement = { x: item.x, y: item.y, bounds: baseBounds };
        const baseOverlap = placedBounds.reduce((sum, placed) => sum + overlapArea(basePlacement.bounds, placed), 0);
        if (baseOverlap <= 0) {
            placements.set(index, basePlacement);
            placedBounds.push(basePlacement.bounds);
            return;
        }

        let best = {
            ...basePlacement,
            score: Number.POSITIVE_INFINITY,
        };
        labelCandidateOffsets(baseBounds).forEach(([dx, dy]) => {
            const candidateItem = {
                ...item,
                x: Number((item.x + dx).toFixed(2)),
                y: Number((item.y + dy).toFixed(2)),
            };
            const x = candidateItem.x;
            const y = candidateItem.y;
            const bounds = estimateTavernMapLabelBounds(candidateItem);
            const overlap = placedBounds.reduce((sum, placed) => sum + overlapArea(bounds, placed), 0);
            const distance = ((x - item.x) * (x - item.x)) + ((y - item.y) * (y - item.y));
            const score = overlap * OVERLAP_WEIGHT + distance * DISTANCE_WEIGHT;
            if (score < best.score) {
                best = { x, y, bounds, score };
            }
        });
        placements.set(index, best);
        placedBounds.push(best.bounds);
    });

    return items.map((item, index) => {
        const placement = placements.get(index);
        return placement ? { ...item, x: placement.x, y: placement.y } : { ...item };
    });
}
