import { BUILDING_POLICY as P, TIER_RULES, PROJECT_TIER, partKey, type Room, type Tier, type Site, type Blueprint } from './policy.js';
import { memoryMaterials, nextMemory, type MemoryId } from './memories.js';
import { initialRooms } from './house.js';
import { constructionBlueprint } from './generation.js';
import { inspect, placementIssue, refitted, type PlacementIssue } from './rules.js';
import { delivery } from './delivery.js';
import { newSupply, supplied, validOffers, type Supply, type StockKind } from './supply.js';
export type Command = { type: 'start' } | { type: 'choose'; choice: number } | { type: 'put'; part: Room } | { type: 'remove'; x: number; y: number; z: number }
    | { type: 'restore'; rooms: Room[] }
    | { type: 'refit'; x: number; y: number; z: number; kind: 'room' | 'study' }
    | { type: 'remember'; memory: MemoryId } | { type: 'reside'; runId: string } | { type: 'finish' } | { type: 'abandon' } | { type: 'collect'; runId: string; save: boolean };
export interface Project { id: string; seed: number; tier: Tier; site: Site; rooms: Room[]; state: 'building' | 'living' | 'abandoned'; saved: boolean; memories: MemoryId[]; supply: Supply | null }
export function projectBlueprint(project: Pick<Project, 'seed' | 'tier' | 'site' | 'memories'>): Blueprint { return { seed: project.seed, tier: project.tier, ...project.site, materials: project.site.materials + memoryMaterials(project.memories) }; }
export interface Receipt { runId: string; tier: Tier; admission: string; ready: string | null; finished: string | null }
export const BUILDING_FORMAT = 7;
export interface BuildingData { format: typeof BUILDING_FORMAT; revision: number; last: { id: string; fingerprint: string } | null; activeId: string | null; projects: Project[]; receipts: Receipt[] }
export function fault(code: string): never { throw Object.assign(new Error(`building_${code}`), { code: `building_${code}` }); }
export function emptyBuilding(): BuildingData { return { format: BUILDING_FORMAT, revision: 0, last: null, activeId: null, projects: [], receipts: [] }; }
export function activeProject(data: BuildingData) { return data.projects.find(p => p.id === data.activeId) ?? null; }
export function payout(receipt: Receipt) { return receipt.finished ? TIER_RULES[receipt.tier].award : receipt.ready ? P.habitableAward : 0; }
export function projectPlacementIssue(project: Project, rooms: Room[]): PlacementIssue | 'stock' | null {
    return placementIssue(projectBlueprint(project), rooms) || (project.supply && !supplied(project.supply, rooms) ? 'stock' : null);
}
function retainHome(data: BuildingData, project: Project | null) {
    if (project?.state !== 'living' || project.saved) { return; }
    if (data.projects.filter(p => p.saved).length >= P.collectionSize) { fault('collection_full'); }
    project.saved = true;
}
export interface PreparedBuilding { id?: string; seed?: number; offers?: StockKind[][] }
export function advance(previous: BuildingData, command: Command, actionId: string, prepared?: PreparedBuilding): BuildingData {
    const data = structuredClone(previous), active = activeProject(data);
    if (command.type === 'start') {
        if (active?.state === 'building') { fault('active'); }
        if (!prepared?.id || prepared.seed === undefined) { fault('identity'); }
        if (!validOffers(prepared.offers)) { fault('supply'); }
        if (data.receipts.some(r => r.runId === prepared.id)) { fault('identity'); }
        retainHome(data, active);
        data.projects = data.projects.filter(p => p.saved);
        data.activeId = prepared.id;
        const brief = constructionBlueprint(prepared.seed), { seed, tier, ...site } = brief;
        data.projects.push({ id: prepared.id, seed, tier, site, rooms: initialRooms(brief), state: 'building', saved: false, memories: [], supply: newSupply(prepared.offers) });
        data.receipts.push({ runId: prepared.id, tier: PROJECT_TIER, admission: actionId, ready: null, finished: null });
    } else if (command.type === 'reside') {
        const home = data.projects.find(p => p.id === command.runId);
        if (!home || home.state !== 'living') { fault('finished'); }
        if (active?.state === 'building') { fault('active'); }
        retainHome(data, active);
        data.projects = data.projects.filter(p => p.saved || p.id === home.id);
        data.activeId = home.id;
    } else if (command.type === 'collect') {
        const project = data.projects.find(p => p.id === command.runId);
        if (!project || project.state !== 'living') { fault('finished'); }
        if (command.save) { retainHome(data, project); } else { project.saved = false; }
        if (!project.saved && project.id !== data.activeId) { data.projects = data.projects.filter(p => p.id !== project.id); }
    } else {
        if (!active || active.state === 'abandoned') { fault('finished'); }
        const brief = projectBlueprint(active), receipt = data.receipts.find(r => r.runId === active.id)!;
        if (command.type === 'put' || command.type === 'remove' || command.type === 'refit' || command.type === 'restore') {
            if (command.type === 'put') { active.rooms.push(command.part); }
            else if (command.type === 'restore') { active.rooms = structuredClone(command.rooms); }
            else if (command.type === 'refit') {
                const replacement = refitted(active.rooms, command, command.kind);
                if (!replacement) { fault('invalid'); }
                active.rooms = replacement;
            }
            else {
                const index = active.rooms.findIndex(p => partKey(p) === partKey(command));
                if (index < 0) { fault('invalid'); }
                active.rooms.splice(index, 1);
            }
            const issue = projectPlacementIssue(active, active.rooms); if (issue) { fault(issue); }
            if (active.state === 'building' && !receipt.ready && inspect(brief, active.rooms).habitable) { receipt.ready = actionId; }
        } else if (command.type === 'choose') {
            if (!active.supply) { fault('finished'); }
            const pack = active.supply.offers[command.choice];
            if (!pack) { fault('supply'); }
            if (active.supply.remaining > 1 && !validOffers(prepared?.offers)) { fault('supply'); }
            active.supply.owned.push(...pack);
            active.supply.remaining--;
            active.supply.offers = active.supply.remaining ? structuredClone(prepared!.offers!) : [];
        } else if (command.type === 'remember') {
            if (active.state !== 'living') { fault('finished'); }
            const opportunity = nextMemory(brief, active.rooms, active.memories);
            if (opportunity?.id !== command.memory || !opportunity.part) { fault('memory_incomplete'); }
            active.memories.push(command.memory);
        } else if (command.type === 'finish') {
            if (active.state !== 'building') { fault('finished'); }
            const result = delivery(brief, active.rooms);
            if (!result.ready) { fault('incomplete'); }
            if (!receipt.ready) { receipt.ready = actionId; }
            if (result.bonus && !receipt.finished) { receipt.finished = actionId; }
            active.state = 'living'; active.supply = null;
        } else {
            if (active.state !== 'building') { fault('finished'); }
            active.state = 'abandoned'; active.supply = null;
        }
    }
    data.revision++; data.last = { id: actionId, fingerprint: JSON.stringify(command) }; return data;
}
