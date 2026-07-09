import type { TavernAtlasDocument, TavernAtlasLink, TavernAtlasLocation } from '../shared/structured-state';

export interface AtlasLayoutResult {
    nodes: AtlasLayoutNode[];
    links: AtlasLayoutLink[];
    viewBox: [number, number, number, number];
    warnings: string[];
}

export interface AtlasLayoutNode {
    key: string;
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
}

export interface AtlasLayoutLink {
    id: string;
    from: string;
    to: string;
    path: string;
    labelX: number;
    labelY: number;
    bounds: [number, number, number, number];
}

const NODE_WIDTH = 128;
const NODE_HEIGHT = 54;
const H_GAP = 36;
const V_GAP = 78;
const ROOT_GAP = 72;
const SAME_ROW_LANE_GAP = 28;

function sortLocations(locations: TavernAtlasLocation[]): TavernAtlasLocation[] {
    return [...locations].sort((left, right) => {
        return String(left.parent || '').localeCompare(String(right.parent || ''))
            || String(left.name || '').localeCompare(String(right.name || ''))
            || String(left.key || '').localeCompare(String(right.key || ''));
    });
}

function collectCycleKeys(locations: Map<string, TavernAtlasLocation>): Set<string> {
    const cycleKeys = new Set<string>();
    locations.forEach((location) => {
        const seen = new Set<string>();
        let current: TavernAtlasLocation | undefined = location;
        while (current?.parent) {
            if (seen.has(current.key)) {
                seen.forEach((key) => cycleKeys.add(key));
                cycleKeys.add(current.key);
                break;
            }
            seen.add(current.key);
            current = locations.get(current.parent);
        }
    });
    return cycleKeys;
}

function sameRowLane(index: number): number {
    const side = index % 2 === 0 ? -1 : 1;
    const step = Math.floor(index / 2) + 1;
    return side * step * SAME_ROW_LANE_GAP;
}

function linkBounds(points: Array<[number, number]>): [number, number, number, number] {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    return [
        Math.min(...xs),
        Math.min(...ys),
        Math.max(...xs),
        Math.max(...ys),
    ];
}

export function layoutTavernAtlasDocument(document: TavernAtlasDocument | null | undefined): AtlasLayoutResult {
    const locations = Array.isArray(document?.locations) ? sortLocations(document.locations) : [];
    const locationMap = new Map(locations.map((location) => [location.key, location]));
    const cycleKeys = collectCycleKeys(locationMap);
    const warnings: string[] = [];
    if (cycleKeys.size) {
        warnings.push('atlas_parent_cycle');
    }

    const children = new Map<string, TavernAtlasLocation[]>();
    const roots: TavernAtlasLocation[] = [];
    locations.forEach((location) => {
        const parent = location.parent || '';
        if (parent && locationMap.has(parent) && !cycleKeys.has(location.key) && !cycleKeys.has(parent)) {
            const bucket = children.get(parent) || [];
            bucket.push(location);
            children.set(parent, bucket);
            return;
        }
        if (parent && !locationMap.has(parent)) {
            warnings.push(`atlas_parent_missing:${location.key}`);
        }
        roots.push(location);
    });
    children.forEach((bucket, key) => children.set(key, sortLocations(bucket)));

    const nodes: AtlasLayoutNode[] = [];
    const subtreeWidth = (location: TavernAtlasLocation): number => {
        const bucket = children.get(location.key) || [];
        if (!bucket.length) {return NODE_WIDTH;}
        return Math.max(
            NODE_WIDTH,
            bucket.reduce((sum, child, index) => sum + subtreeWidth(child) + (index > 0 ? H_GAP : 0), 0),
        );
    };

    const placeNode = (location: TavernAtlasLocation, left: number, depth: number): number => {
        const width = subtreeWidth(location);
        const x = left + (width - NODE_WIDTH) / 2;
        nodes.push({
            key: location.key,
            x,
            y: depth * (NODE_HEIGHT + V_GAP),
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            depth,
        });
        let childLeft = left;
        (children.get(location.key) || []).forEach((child) => {
            const childWidth = subtreeWidth(child);
            placeNode(child, childLeft, depth + 1);
            childLeft += childWidth + H_GAP;
        });
        return width;
    };

    let left = 0;
    sortLocations(roots).forEach((root) => {
        const width = placeNode(root, left, 0);
        left += width + ROOT_GAP;
    });

    const nodeMap = new Map(nodes.map((node) => [node.key, node]));
    const sameRowIndexes = new Map<number, number>();
    const links = (Array.isArray(document?.links) ? document.links : [])
        .map((link: TavernAtlasLink): AtlasLayoutLink | null => {
            const from = nodeMap.get(link.from);
            const to = nodeMap.get(link.to);
            if (!from || !to) {
                warnings.push(`atlas_link_endpoint_missing:${link.id}`);
                return null;
            }
            const fromCenterX = from.x + from.width / 2;
            const fromCenterY = from.y + from.height / 2;
            const toCenterX = to.x + to.width / 2;
            const toCenterY = to.y + to.height / 2;
            const dx = toCenterX - fromCenterX;
            const dy = toCenterY - fromCenterY;
            const sameRow = Math.abs(dy) < 1;
            const x1 = Math.abs(dx) >= Math.abs(dy)
                ? (dx >= 0 ? from.x + from.width : from.x)
                : fromCenterX;
            const y1 = Math.abs(dx) >= Math.abs(dy)
                ? fromCenterY
                : (dy >= 0 ? from.y + from.height : from.y);
            const x2 = Math.abs(dx) >= Math.abs(dy)
                ? (dx >= 0 ? to.x : to.x + to.width)
                : toCenterX;
            const y2 = Math.abs(dx) >= Math.abs(dy)
                ? toCenterY
                : (dy >= 0 ? to.y : to.y + to.height);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            if (sameRow) {
                const rowKey = Math.round(fromCenterY);
                const laneIndex = sameRowIndexes.get(rowKey) || 0;
                sameRowIndexes.set(rowKey, laneIndex + 1);
                const laneOffset = sameRowLane(laneIndex);
                const labelY = midY + laneOffset + (laneOffset < 0 ? -8 : 16);
                const path = `M ${x1} ${y1} C ${x1} ${y1 + laneOffset}, ${x2} ${y2 + laneOffset}, ${x2} ${y2}`;
                return {
                    id: link.id,
                    from: link.from,
                    to: link.to,
                    path,
                    labelX: midX,
                    labelY,
                    bounds: linkBounds([[x1, y1], [x1, y1 + laneOffset], [x2, y2 + laneOffset], [x2, y2], [midX, labelY]]),
                };
            }
            return {
                id: link.id,
                from: link.from,
                to: link.to,
                path: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
                labelX: midX,
                labelY: midY - 8,
                bounds: linkBounds([[x1, y1], [x1, midY], [x2, midY], [x2, y2], [midX, midY - 8]]),
            };
        })
        .filter((link): link is AtlasLayoutLink => !!link);

    if (!nodes.length) {
        return { nodes, links, viewBox: [0, 0, 640, 360], warnings };
    }
    const minX = Math.min(...nodes.map((node) => node.x), ...links.map((link) => link.bounds[0])) - 48;
    const minY = Math.min(...nodes.map((node) => node.y), ...links.map((link) => link.bounds[1])) - 48;
    const maxX = Math.max(...nodes.map((node) => node.x + node.width), ...links.map((link) => link.bounds[2])) + 48;
    const maxY = Math.max(...nodes.map((node) => node.y + node.height), ...links.map((link) => link.bounds[3])) + 48;
    return {
        nodes,
        links,
        viewBox: [minX, minY, Math.max(320, maxX - minX), Math.max(220, maxY - minY)],
        warnings,
    };
}
