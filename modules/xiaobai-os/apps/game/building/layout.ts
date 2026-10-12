import { cells, partKey, solid, type Blueprint, type Part } from './policy.js';
type Position = Pick<Part, 'x' | 'y' | 'z'>;
export function neighbours(p: Position): Position[] {
    return [{ ...p, x: p.x - 1 }, { ...p, x: p.x + 1 }, { ...p, z: p.z - 1 }, { ...p, z: p.z + 1 }];
}
export function occupancy(parts: Part[]) {
    const map = new Map<string, Part>();
    for (const p of parts) { for (const c of cells(p)) { map.set(partKey(c), p); } }
    return map;
}
export function walk(brief: Blueprint, parts: Part[], origin: Position = { x: brief.entrance, y: 0, z: brief.entryZ }) {
    const map = occupancy(parts), links = stairLinks(brief, parts), start = partKey(origin), parents = new Map<string, string | null>();
    if (!map.has(start) || map.get(start)!.kind === 'roof') { return parents; }
    const queue = [origin]; parents.set(start, null);
    for (let i = 0; i < queue.length; i++) {
        const p = queue[i], key = partKey(p), candidates = neighbours(p);
        if (links.has(key)) { candidates.push({ ...p, y: p.y + 1 }); }
        if (links.has(partKey({ ...p, y: p.y - 1 }))) { candidates.push({ ...p, y: p.y - 1 }); }
        for (const c of candidates) {
            const next = partKey(c), part = map.get(next);
            if (part && part.kind !== 'roof' && !parents.has(next)) { parents.set(next, key); queue.push(c); }
        }
    }
    return parents;
}
export function connected(brief: Blueprint, parts: Part[]) { return walk(brief, parts); }
export function routeTo(brief: Blueprint, parts: Part[], destination: Position, origin?: Position) {
    const parents = walk(brief, parts, origin); let key: string | null = partKey(destination);
    if (!parents.has(key)) { return []; }
    const route: Position[] = [];
    while (key !== null) { const [x, y, z] = key.split(':').map(Number); route.unshift({ x, y, z }); key = parents.get(key)!; }
    return route;
}
/** One real stair per connected upper-floor plane. The lower room retains its purpose. */
export function stairLinks(brief: Blueprint, parts: Part[]) {
    const map = occupancy(parts), links = new Set<string>(), seen = new Set<string>();
    for (const start of parts.filter(p => p.y > 0 && p.kind !== 'roof').flatMap(cells)) {
        if (seen.has(partKey(start))) { continue; }
        const segment = [start]; seen.add(partKey(start));
        for (let i = 0; i < segment.length; i++) {
            for (const p of neighbours(segment[i])) {
                const key = partKey(p), part = map.get(key);
                if (part && part.kind !== 'roof' && !seen.has(key)) { seen.add(key); segment.push(p); }
            }
        }
        const candidates = segment.map(p => ({ ...p, y: p.y - 1 })).filter(p => { const below = map.get(partKey(p)); return below && solid(below.kind); });
        const hall = (p: Position) => ['hall', 'entry'].includes(map.get(partKey(p))!.kind) ? 0 : 1;
        const distance = (p: Position) => Math.abs(p.x - brief.entrance) + Math.abs(p.z - brief.entryZ);
        candidates.sort((a, b) => hall(a) - hall(b) || distance(a) - distance(b) || a.z - b.z || a.x - b.x);
        if (candidates.length) { links.add(partKey(candidates[0])); }
    }
    return links;
}
