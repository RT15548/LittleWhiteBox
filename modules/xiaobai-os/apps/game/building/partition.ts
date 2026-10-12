import type { PartitionRegistration } from '../../../kernel/contracts.js';
import { BUILDING_POLICY as P, ROOM_CHOICES, TIERS, TIER_RULES, type Room, type Tier, type Site } from './policy.js';
import { BUILDING_FORMAT, emptyBuilding, activeProject, projectBlueprint, fault, type BuildingData, type Command } from './domain.js';
import { STOCK_KINDS, SUPPLY_ROUNDS, SUPPLY_CHOICES, supplied, validOffers, type StockKind, type Supply } from './supply.js';
import { placementIssue } from './rules.js';
import { MEMORY_IDS, type MemoryId } from './memories.js';
import { upgradeBuilding } from './upgrade.js';
function record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { fault('invalid'); }
    return value as Record<string, unknown>;
}
export function buildingId(value: unknown): string { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) { fault('identity'); } return value; }
export function newBuildingId() { return [...crypto.getRandomValues(new Uint32Array(4))].map(v => v.toString(16).padStart(8, '0')).join(''); }
function site(raw: unknown, kind: Tier): Site {
    const s = record(raw);
    const integer = (n: unknown, min: number, max: number) => Number.isSafeInteger(n) && Number(n) >= min && Number(n) <= max;
    if (!integer(s.width, 3, P.maxWidth) || !integer(s.depth, 1, P.maxDepth) || !integer(s.entryZ, 0, Number(s.depth) - 1) || s.floors !== TIER_RULES[kind].floors
        || !integer(s.entrance, 1, Number(s.width) - 2) || !integer(s.living, 1, P.maxParts)
        || !integer(s.materials, 1, P.maxParts * 2) || ![-1, 1].includes(Number(s.gardenSide)) || ![-1, 1].includes(Number(s.sunSide))
        || typeof s.gardenSide !== 'number' || typeof s.sunSide !== 'number'
        || s.terraces !== (kind === 'terrace' || kind === 'sunroom' ? 1 : 0)
        || !Array.isArray(s.heights) || s.heights.length !== Number(s.width) * Number(s.depth) || s.heights.some(h => !integer(h, 0, Number(s.floors)))
        || Object.keys(s).some(key => !['width', 'depth', 'entryZ', 'floors', 'heights', 'entrance', 'living', 'materials', 'gardenSide', 'sunSide', 'terraces'].includes(key))) { fault('invalid'); }
    return s as unknown as Site;
}
function tier(value: unknown): Tier { if (!TIERS.includes(value as Tier)) { fault('invalid'); } return value as Tier; }
function position(value: Record<string, unknown>) {
    if (!Number.isInteger(value.z) || Number(value.z) < 0 || Number(value.z) >= P.maxDepth || !Number.isInteger(value.x) || !Number.isInteger(value.y) || Number(value.x) < 0 || Number(value.x) >= P.maxWidth
        || Number(value.y) < 0 || Number(value.y) > Math.max(...TIERS.map(t => TIER_RULES[t].floors))) { fault('invalid'); }
    return { x: Number(value.x), y: Number(value.y), z: Number(value.z) };
}
function room(raw: unknown): Room {
    const value = record(raw); if (value.kind !== 'hall' && !ROOM_CHOICES.includes(value.kind as Room['kind'] & typeof ROOM_CHOICES[number])) { fault('invalid'); }
    return { kind: value.kind as Room['kind'], ...position(value) };
}
export function parseCommand(raw: unknown): Command {
    const value = record(raw);
    switch (value.type) {
        case 'start': return { type: value.type };
        case 'choose': if (!Number.isInteger(value.choice) || Number(value.choice) < 0 || Number(value.choice) >= SUPPLY_CHOICES) { fault('invalid'); } return { type: value.type, choice: Number(value.choice) };
        case 'put': { const part = room(value.part); if (part.kind === 'hall') { fault('invalid'); } return { type: value.type, part }; }
        case 'restore': if (!Array.isArray(value.rooms) || value.rooms.length > P.maxParts) { fault('invalid'); } return { type: value.type, rooms: value.rooms.map(room) };
        case 'remove': return { type: value.type, ...position(value) };
        case 'refit': if (value.kind !== 'room' && value.kind !== 'study') { fault('invalid'); } return { type: value.type, ...position(value), kind: value.kind };
        case 'finish': case 'abandon': return { type: value.type };
        case 'remember': if (!MEMORY_IDS.includes(value.memory as MemoryId)) { fault('invalid'); } return { type: value.type, memory: value.memory as MemoryId };
        case 'reside': return { type: value.type, runId: buildingId(value.runId) };
        case 'collect': if (typeof value.save !== 'boolean') { fault('invalid'); } return { type: value.type, runId: buildingId(value.runId), save: value.save };
        default: return fault('invalid');
    }
}
export function validateBuilding(raw: unknown): asserts raw is BuildingData {
    const value = record(raw);
    if (value.format !== BUILDING_FORMAT || !Number.isSafeInteger(value.revision) || Number(value.revision) < 0 || !Array.isArray(value.projects) || !Array.isArray(value.receipts)) { fault('invalid'); }
    if (value.last !== null) { const last = record(value.last); buildingId(last.id); if (typeof last.fingerprint !== 'string' || last.fingerprint.length > 8000) { fault('invalid'); } }
    if ((value.revision === 0) !== (value.last === null)) { fault('invalid'); }
    const receipts = new Map<string, BuildingData['receipts'][number]>(), actionIds = new Set<string>();
    for (const rawReceipt of value.receipts) {
        const r = record(rawReceipt); const id = buildingId(r.runId); tier(r.tier); buildingId(r.admission);
        if (receipts.has(id) || r.finished !== null && r.ready === null) { fault('invalid'); }
        if (r.admission === r.ready || r.admission === r.finished) { fault('identity'); }
        for (const action of new Set([r.admission, r.ready, r.finished])) {
            if (action === null) { continue; }
            const key = buildingId(action); if (actionIds.has(key)) { fault('identity'); } actionIds.add(key);
        }
        receipts.set(id, r as unknown as BuildingData['receipts'][number]);
    }
    const ids = new Set<string>(); let saved = 0;
    for (const rawProject of value.projects) {
        const p = record(rawProject), id = buildingId(p.id), kind = tier(p.tier);
        if (ids.has(id) || !Number.isSafeInteger(p.seed) || Number(p.seed) < 0 || Number(p.seed) > 0xffffffff
            || !Array.isArray(p.memories) || p.memories.length > MEMORY_IDS.length || new Set(p.memories).size !== p.memories.length || p.memories.some(id => !MEMORY_IDS.includes(id))
            || p.memories.length > 0 && p.state !== 'living'
            || !Array.isArray(p.rooms) || p.rooms.length > P.maxParts || typeof p.saved !== 'boolean'
            || !['building', 'living', 'abandoned'].includes(String(p.state))) { fault('invalid'); }
        ids.add(id); const rooms = p.rooms.map(room), brief = projectBlueprint({ seed: Number(p.seed), tier: kind, site: site(p.site, kind), memories: p.memories as MemoryId[] }), receipt = receipts.get(id);
        if (p.state === 'building') {
            const supply = record(p.supply);
            if (!Array.isArray(supply.owned) || supply.owned.length > P.maxParts * 2 || supply.owned.some(k => !STOCK_KINDS.includes(k as StockKind))
                || !Number.isInteger(supply.remaining) || Number(supply.remaining) < 0 || Number(supply.remaining) > SUPPLY_ROUNDS
                || (supply.remaining === 0 ? !Array.isArray(supply.offers) || supply.offers.length !== 0 : !validOffers(supply.offers))
                || Object.keys(supply).some(k => !['owned', 'remaining', 'offers'].includes(k)) || !supplied(supply as unknown as Supply, rooms)) { fault('invalid'); }
        } else if (p.supply !== null) { fault('invalid'); }
        // Paid receipts are history, not a request to re-judge old awards under the current commission.
        if (!receipt || receipt.tier !== kind || placementIssue(brief, rooms) || receipt.finished && p.state !== 'living'
            || p.state === 'living' && !receipt.ready || p.saved && p.state !== 'living'
            || !p.saved && id !== value.activeId) { fault('invalid'); }
        if (p.saved) { saved++; }
    }
    const data = raw as BuildingData;
    if (saved > P.collectionSize || value.projects.length > P.collectionSize + 1
        || (data.activeId === null ? data.projects.length > 0 || data.receipts.length > 0 : !activeProject(data))) { fault('invalid'); }
}
export const BUILDING_PARTITION: PartitionRegistration<BuildingData> = {
    key: 'building', ownerId: 'game', storage: 'user', schemaVersion: BUILDING_FORMAT, createInitial: emptyBuilding,
    parse(raw) { try { const value = upgradeBuilding(raw); validateBuilding(value); return { ok: true, value: structuredClone(value) }; }
        catch (error) { return { ok: false, error: { code: 'partition_invalid', message: error instanceof Error ? error.message : 'building_invalid' } }; } },
    serialize(value) { validateBuilding(value); return structuredClone(value); },
};
