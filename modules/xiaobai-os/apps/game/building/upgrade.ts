import { fault } from './domain.js';

// Compatibility: the explicitly retained pre-automatic-building works. Delete this
// boundary converter only when importing those saved works is no longer supported.
// Frozen v1 shape; never alias this to the current Project or Command.
interface BuildingV1 {
    revision: number; last: { id: string; command: unknown } | null; activeId: string | null;
    projects: { id: string; seed: number; tier: 'courtyard' | 'duplex' | 'terrace' | 'sunroom';
        parts: { kind: 'entry' | 'stairs' | 'roof' | 'room' | 'wide' | 'study' | 'terrace' | 'garden'; x: number; y: number }[];
        end: 'complete' | 'abandoned' | null; saved: boolean }[];
    receipts: { runId: string; tier: string; admission: string; ready: string | null; finished: string | null }[];
}
interface BuildingV2 {
    format: 2; revision: number; last: { id: string; fingerprint: string } | null; activeId: string | null;
    projects: { id: string; seed: number; tier: 'courtyard' | 'duplex' | 'terrace' | 'sunroom';
        rooms: { kind: 'hall' | 'room' | 'wide' | 'study' | 'terrace' | 'garden'; x: number; y: number }[];
        end: 'complete' | 'abandoned' | null; saved: boolean }[];
    receipts: { runId: string; tier: string; admission: string; ready: string | null; finished: string | null }[];
}
// Frozen v3 carries the exact paid plot, unlike seed-derived v1/v2.
interface SiteV3 { width: number; floors: number; heights: number[]; entrance: number; living: number; gardenSide: -1 | 1; terraces: number; materials: number; sunSide: -1 | 1 }
interface BuildingV3 {
    format: 3; revision: number; last: { id: string; fingerprint: string } | null; activeId: string | null;
    projects: (BuildingV2['projects'][number] & { site: SiteV3 })[];
    receipts: BuildingV2['receipts'];
}
function spatialHome(old: BuildingV3) {
    if (!Array.isArray(old.projects)) { fault('invalid'); }
    return { ...old, format: 4, projects: old.projects.map(p => {
        if (![null, 'complete', 'abandoned'].includes(p.end) || !Array.isArray(p.rooms) || !Array.isArray(p.site.heights) || p.site.heights.length !== p.site.width) { fault('invalid'); }
        const { end, ...project } = p;
        return { ...project, state: end === null ? 'building' : end === 'complete' ? 'living' : 'abandoned',
            site: { ...p.site, depth: 3, entryZ: 1, heights: [...Array<number>(p.site.width).fill(1), ...p.site.heights, ...Array<number>(p.site.width).fill(1)] },
            rooms: p.rooms.map(room => ({ ...room, z: 1 })) };
    }) };
}
/** Frozen v1/v2 plot algorithm. Only the import boundary may reconstruct paid plots. */
function historicalSite(seed: number, tier: BuildingV1['projects'][number]['tier']): SiteV3 {
    const rules = { courtyard: [1, 2, 12], duplex: [2, 4, 18], terrace: [3, 5, 24], sunroom: [2, 2, 16] }[tier];
    if (!rules || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) { fault('invalid'); }
    let state = seed >>> 0;
    const random = (size: number) => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return Math.floor(state / 0x100000000 * size); };
    const width = (tier === 'duplex' ? 4 : 5) + random(2);
    return { width, floors: rules[0], heights: Array<number>(width).fill(rules[0]), entrance: 1 + random(width - 2), living: rules[1] + random(2),
        gardenSide: random(2) ? 1 : -1, terraces: tier === 'terrace' || tier === 'sunroom' ? 1 : 0,
        materials: rules[2] - 1 + random(3), sunSide: (seed >>> 8) % 2 ? 1 : -1 };
}
function upgradeSpatial(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') { return raw; }
    if ('format' in raw) {
        if (raw.format === 3) { return spatialHome(raw as BuildingV3); }
        if (raw.format !== 2) { return raw; }
        const old = raw as BuildingV2;
        if (!Array.isArray(old.projects)) { fault('invalid'); }
        return spatialHome({ ...old, format: 3, projects: old.projects.map(p => ({ ...p, site: historicalSite(p.seed, p.tier) })) });
    }
    const old = raw as BuildingV1;
    if (!Array.isArray(old.projects) || !Array.isArray(old.receipts)) { fault('invalid'); }
    const projects = old.projects.map(p => {
        if (!['courtyard', 'duplex', 'terrace', 'sunroom'].includes(p.tier) || !Array.isArray(p.parts) || p.parts.length > 40
            || p.parts.some(part => !['entry', 'stairs', 'roof', 'room', 'wide', 'study', 'terrace', 'garden'].includes(part.kind)
                || !Number.isInteger(part.x) || part.x < 0 || part.x > 5 || !Number.isInteger(part.y) || part.y < 0 || part.y > 3)) { fault('invalid'); }
        const rooms: BuildingV2['projects'][number]['rooms'] = p.parts.filter(part => part.kind !== 'roof').map(part => ({
            ...part, kind: part.kind === 'entry' || part.kind === 'stairs' ? 'hall' : part.kind as BuildingV2['projects'][number]['rooms'][number]['kind'],
        }));
        const b = historicalSite(p.seed, p.tier);
        const occupied = new Set(rooms.filter(r => r.y === 0).flatMap(r => r.kind === 'wide' ? [r.x, r.x + 1] : [r.x]));
        // Previously unfinished isolated wings gain a free ground-floor corridor.
        const left = Math.min(b.entrance, ...occupied), right = Math.max(b.entrance, ...occupied);
        for (let x = left; x <= right; x++) { if (!occupied.has(x)) { rooms.push({ kind: 'hall', x, y: 0 }); } }
        return { id: p.id, seed: p.seed, tier: p.tier, site: b, rooms, end: p.end, saved: p.saved };
    });
    return spatialHome({ format: 3, revision: old.revision, last: old.last ? { id: old.last.id, fingerprint: JSON.stringify(old.last.command) } : null,
        activeId: old.activeId, projects, receipts: structuredClone(old.receipts) });
}

// Frozen format 4: actual retained spatial homes, without life memories.
interface BuildingV4 {
    format: 4; revision: number; last: { id: string; fingerprint: string } | null; activeId: string | null;
    projects: { id: string; seed: number; tier: 'courtyard' | 'duplex' | 'terrace' | 'sunroom';
        site: { width: number; depth: number; entryZ: number; floors: number; heights: number[]; entrance: number;
            living: number; gardenSide: -1 | 1; terraces: number; materials: number; sunSide: -1 | 1 };
        rooms: { kind: 'hall' | 'room' | 'wide' | 'study' | 'terrace' | 'garden' | 'path'; x: number; y: number; z: number }[];
        state: 'building' | 'living' | 'abandoned'; saved: boolean }[];
    receipts: { runId: string; tier: string; admission: string; ready: string | null; finished: string | null }[];
}
function upgradeMemories(raw: unknown): unknown {
    const spatial = upgradeSpatial(raw);
    if (!spatial || typeof spatial !== 'object' || !('format' in spatial) || spatial.format !== 4) { return spatial; }
    const old = spatial as BuildingV4;
    if (!Array.isArray(old.projects)) { fault('invalid'); }
    // A suitable existing layout is not evidence that its new memory has been claimed.
    return { ...old, format: 5, projects: old.projects.map(project => ({ ...project, memories: [] })) };
}

// Frozen format 5: the user's retained houses and paid stage receipts.
// Remove this conversion only when these explicitly retained saves are no longer supported.
interface BuildingV5 {
    format: 5; revision: number; last: { id: string; fingerprint: string } | null; activeId: string | null;
    projects: (BuildingV4['projects'][number] & { memories: string[] })[];
    receipts: BuildingV4['receipts'];
}
function upgradeProcurement(raw: unknown): unknown {
    const remembered = upgradeMemories(raw);
    if (!remembered || typeof remembered !== 'object' || !('format' in remembered) || remembered.format !== 5) { return remembered; }
    const old = remembered as BuildingV5;
    if (!Array.isArray(old.projects)) { fault('invalid'); }
    return { ...old, format: 6, projects: old.projects.map(p => {
        if (!Array.isArray(p.rooms)) { fault('invalid'); }
        // Paid land, placed rooms and money stay unchanged. An unfinished house enters
        // current procurement with its existing rooms plus the two-room starter allowance.
        const initial = [...p.rooms.filter(r => r.kind !== 'hall' && r.kind !== 'path').map(r => r.kind), 'room', 'room'];
        return { ...p, supply: p.state === 'building' ? { initial, picks: [] } : null };
    }) };
}

// Frozen v6 → v7: preserve the user's already acquired rooms and currently visible offer.
// Remove only when the explicitly retained v6 work is no longer supported.
type StockV6 = 'room' | 'wide' | 'study' | 'terrace' | 'garden';
interface BuildingV6 {
    format: 6; revision: number; last: BuildingV5['last']; activeId: string | null;
    projects: (BuildingV5['projects'][number] & { supply: { initial: StockV6[]; picks: StockV6[][] } | null })[];
    receipts: BuildingV5['receipts'];
}
function visibleOfferV6(seed: number, round: number): StockV6[][] {
    let state = (seed ^ Math.imul(round + 1, 2246822519)) >>> 0;
    const deck: StockV6[][] = [['wide', 'room'], ['study', 'room'], ['garden', 'room', 'room'],
        ['terrace', 'room', 'room'], ['study', 'garden'], ['wide', 'terrace'], ['garden', 'garden', 'room']];
    for (let i = deck.length - 1; i > 0; i--) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        const j = state % (i + 1); [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck.slice(0, 3);
}
export function upgradeBuilding(raw: unknown): unknown {
    const supplied = upgradeProcurement(raw);
    if (!supplied || typeof supplied !== 'object' || !('format' in supplied) || supplied.format !== 6) { return supplied; }
    const old = supplied as BuildingV6;
    if (!Array.isArray(old.projects)) { fault('invalid'); }
    return { ...old, format: 7, projects: old.projects.map(p => {
        if (p.state !== 'building') { if (p.supply !== null) { fault('invalid'); } return p; }
        if (!p.supply || !Array.isArray(p.supply.initial) || !Array.isArray(p.supply.picks) || p.supply.picks.length > 6
            || p.supply.picks.some(pack => !Array.isArray(pack) || pack.length < 2 || pack.length > 3)) { fault('invalid'); }
        const remaining = Math.min(3, 6 - p.supply.picks.length);
        return { ...p, supply: { owned: [...p.supply.initial, ...p.supply.picks.flat()], remaining,
            offers: remaining ? visibleOfferV6(p.seed, p.supply.picks.length) : [] } };
    }) };
}
