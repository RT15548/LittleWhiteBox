import { TIER_RULES, BUILDING_POLICY as P, PROJECT_TIER, type Blueprint, type Room, type Tier } from './policy.js';
import { inspect, placementIssue, materialUsed, legalPlaces } from './rules.js';
import { delivery } from './delivery.js';

export function siteLimits(tier: Tier) {
    const rules = TIER_RULES[tier], minWidth = tier === 'courtyard' ? 5 : 4;
    return { minWidth, maxWidth: P.maxWidth, floors: rules.floors, minMaterials: rules.materials, maxMaterials: rules.materials + 1 };
}

export function blueprint(seed: number, tier: Tier): Blueprint {
    let state = seed >>> 0;
    const random = (size: number) => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return Math.floor(state / 0x100000000 * size); };
    const limits = siteLimits(tier), width = limits.minWidth + random(limits.maxWidth - limits.minWidth + 1), rules = TIER_RULES[tier];
    const base = { seed, tier, width, depth: 3, entryZ: 2, floors: rules.floors, entrance: 1 + random(width - 2), living: rules.living + random(2),
        gardenSide: random(2) ? 1 : -1, terraces: tier === 'terrace' || tier === 'sunroom' ? 1 : 0, materials: limits.minMaterials + random(limits.maxMaterials - limits.minMaterials + 1),
        sunSide: random(2) ? 1 : -1 };
    const heights = Array<number>(width).fill(1);
    let left = 0, span = width;
    for (let floor = 2; floor <= rules.floors; floor++) {
        const nextSpan = 2 + random(Math.min(span - 1, 3));
        left += random(span - nextSpan + 1); span = nextSpan;
        for (let x = left; x < left + span; x++) { heights[x] = floor; }
    }
    return { ...base, heights: Array.from({ length: base.depth }, () => heights).flat(), gardenSide: base.gardenSide as -1 | 1, sunSide: base.sunSide as -1 | 1 };
}

/** Complete layouts; the foyer is already present when a project starts. */
export function basicPlans(brief: Blueprint): Room[][] {
    return [-1, 1].map(side => [
        { kind: 'hall', x: brief.entrance, y: 0, z: brief.entryZ }, { kind: 'room', x: brief.entrance + side, y: 0, z: brief.entryZ },
    ] as Room[]).filter(rooms => !placementIssue(brief, rooms));
}
export function certifiedPlans(brief: Blueprint, limit = 2): Room[][] {
    const results: Room[][] = [];
    const accept = (rooms: Room[]) => {
        if (!placementIssue(brief, rooms) && inspect(brief, rooms).fulfilled) { results.push(rooms); }
    };
    for (let left = 0; left <= brief.entrance; left++) {
        for (let right = Math.max(left + 1, brief.entrance); right < brief.width; right++) {
            const ground: Room[] = Array.from({ length: right - left + 1 }, (_, i) => ({
                kind: left + i === brief.entrance ? 'hall' : 'room', x: left + i, y: 0, z: brief.entryZ,
            }));
            ground.sort((a, b) => Math.abs(a.x - brief.entrance) - Math.abs(b.x - brief.entrance));
            if (brief.tier === 'courtyard') {
                const x = brief.gardenSide === -1 ? left - 1 : right + 1;
                accept([...ground, { kind: 'garden', x, y: 0, z: brief.entryZ }]);
            } else {
                for (let upperLeft = left; upperLeft <= right; upperLeft++) {
                    for (let upperRight = upperLeft; upperRight <= right; upperRight++) {
                        const rooms = [...ground];
                        for (let y = 1; y < brief.floors; y++) {
                            for (let x = upperLeft; x <= upperRight; x++) {
                                const edge = (brief.tier === 'sunroom' ? brief.sunSide : brief.gardenSide) === -1 ? upperLeft : upperRight;
                                rooms.push({ kind: brief.terraces && y === brief.floors - 1 && x === edge ? 'terrace' : 'room', x, y, z: brief.entryZ });
                            }
                        }
                        if (brief.tier === 'sunroom') {
                            for (const room of rooms.filter(p => p.kind === 'room')) { accept(rooms.map(p => p === room ? { ...p, kind: 'study' } : p)); }
                        } else { accept(rooms); }
                    }
                }
            }
        }
    }
    // Prefer economical witnesses. They certify solvability, never select player placements.
    results.sort((a, b) => materialUsed(a) - materialUsed(b));
    const seen = new Set<string>();
    return results.filter(plan => {
        const key = JSON.stringify(plan.filter(p => brief.tier !== 'sunroom' || p.kind === 'study' || p.kind === 'terrace'));
        if (seen.has(key)) { return false; } seen.add(key); return true;
    }).slice(0, limit);
}
export async function generate(seed: number, tier: Tier): Promise<number> {
    for (let attempt = 0; attempt < P.seedAttempts; attempt++) {
        const candidate = (seed + Math.imul(attempt, 2654435761)) >>> 0;
        if (certifiedPlans(blueprint(candidate, tier)).length >= 2) { return candidate; }
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    throw Object.assign(new Error('building_generation'), { code: 'building_generation' });
}

export function constructionBlueprint(seed: number): Blueprint {
    const b = blueprint(seed, PROJECT_TIER);
    // A cut-out front corner creates a real land constraint, rather than more empty grid.
    const side = b.entrance < (b.width - 1) / 2 ? b.width - 1 : 0;
    for (const z of [0, 1]) { b.heights[z * b.width + side] = 0; }
    const back = side === 0 ? b.width - 1 : 0;
    if ((seed >>> 5) % 2 && Math.abs(back - b.entrance) > 1) { b.heights[back] = 0; }
    return b;
}
export function constructionPlans(brief: Blueprint, limit = 2): Room[][] {
    const results: Room[][] = [];
    // Certify a ground-floor courtyard as well as an upstairs route, not two cosmetic variants.
    for (const side of [-1, 1]) {
        const x = brief.entrance, z = brief.entryZ;
        const plan: Room[] = [
            { kind: 'hall', x, y: 0, z }, { kind: 'room', x: x + side, y: 0, z },
            { kind: 'garden', x, y: 0, z: z - 1 }, { kind: 'study', x: x + side, y: 0, z: z - 1 },
            { kind: 'wide', x: Math.min(x, x + side), y: 0, z: z - 2 },
        ];
        if (!placementIssue(brief, plan) && delivery(brief, plan).bonus) { results.push(plan); break; }
    }
    if (results.length >= limit) { return results.slice(0, limit); }
    for (const base of certifiedPlans(brief, 100)) {
        for (const room of legalPlaces(brief, base, 'wide')) {
            const plan = [...base, room];
            if (delivery(brief, plan).bonus) { results.push(plan); }
            if (results.length >= limit) { return results; }
        }
    }
    return results;
}
export async function generateConstruction(seed: number): Promise<number> {
    for (let attempt = 0; attempt < P.seedAttempts; attempt++) {
        const candidate = (seed + Math.imul(attempt, 2654435761)) >>> 0;
        const plans = constructionPlans(constructionBlueprint(candidate));
        if (plans.some(rooms => rooms.every(p => p.y === 0)) && plans.some(rooms => rooms.some(p => p.kind === 'terrace'))) { return candidate; }
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    throw Object.assign(new Error('building_generation'), { code: 'building_generation' });
}
