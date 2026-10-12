export interface LabelPoint { x: number; y: number }
export interface LabelRect extends LabelPoint { w: number; h: number }
export interface ProjectedLabel {
    id: string;
    anchor: LabelPoint;
    badgeAnchor?: LabelPoint;
    priority: number;
    badge?: { w: number; h: number };
    caption?: { w: number; h: number };
}
export interface PlacedLabel {
    anchor: LabelPoint;
    badge?: LabelRect;
    caption?: LabelRect;
}

const overlaps = (a: LabelRect, b: LabelRect) => a.x < b.x + b.w + 3 && a.x + a.w + 3 > b.x
    && a.y < b.y + b.h + 3 && a.y + a.h + 3 > b.y;

/** Screen-space presentation only. Location dots never participate in text culling. */
export function layoutSceneLabels(labels: readonly ProjectedLabel[], width: number, height: number, reserved: readonly LabelRect[] = []): Map<string, PlacedLabel> {
    const placed = new Map<string, PlacedLabel>();
    const ordered = [...labels].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
    const occupied = [...reserved];
    const dots = ordered.filter(item => item.badge).map(({ anchor }) => ({ x: anchor.x - 3, y: anchor.y - 3, w: 6, h: 6 }));
    const fits = (r: LabelRect) => r.x >= 3 && r.y >= 3 && r.x + r.w <= width - 3 && r.y + r.h <= height - 3;
    const free = (r: LabelRect) => fits(r) && !occupied.some(b => overlaps(r, b)) && !dots.some(b => overlaps(r, b));
    // Place every badge before any caption, so names cannot displace people or entrances.
    for (const item of ordered) {
        const result: PlacedLabel = { anchor: { ...item.anchor } };
        placed.set(item.id, result);
        if (!item.badge) {continue;}
        const { w, h } = item.badge, { x, y } = item.badgeAnchor || item.anchor;
        const candidates: LabelRect[] = [];
        for (const gap of [9, 27, 45]) {
            candidates.push(
                { x: x - w / 2, y: y - h - gap, w, h },
                { x: x + gap, y: y - h / 2, w, h },
                { x: x - w - gap, y: y - h / 2, w, h },
                { x: x - w / 2, y: y + gap, w, h },
            );
        }
        // Extreme density can overlap badges, but never removes the true location.
        // Priority order keeps the player in the nearest available position.
        const bounded = candidates.map(candidate => ({
            x: Math.max(3, Math.min(width - w - 3, candidate.x)),
            y: Math.max(3, Math.min(height - h - 3, candidate.y)), w, h,
        }));
        result.badge = bounded.find(free) || bounded[0];
        occupied.push(result.badge);
    }
    for (const item of ordered) {
        if (!item.caption) {continue;}
        const result = placed.get(item.id)!;
        const { w, h } = item.caption;
        const target = result.badge || { ...item.anchor, w: 0, h: 0 };
        const candidates = [
            { x: target.x + (target.w - w) / 2, y: target.y - h - 5, w, h },
            { x: target.x + target.w + 6, y: target.y + (target.h - h) / 2, w, h },
            { x: target.x - w - 6, y: target.y + (target.h - h) / 2, w, h },
            { x: target.x + (target.w - w) / 2, y: target.y + target.h + 5, w, h },
        ];
        result.caption = candidates.find(free);
        if (result.caption) {occupied.push(result.caption);}
    }
    return placed;
}
