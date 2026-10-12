import { ECONOMY_TRANSACTION_CAPABILITY, type EconomyReadCapability } from '../../../capabilities/economy/index.js';
import type { PartitionStore, XiaobaiOsFileControls, XiaobaiOsFileState } from '../../../kernel/contracts.js';
import { advance, activeProject, emptyBuilding, fault, payout, projectBlueprint, type BuildingData, type Project, type Command, type PreparedBuilding } from './domain.js';
import { drawOffers, type StockKind } from './supply.js';
import { generateConstruction } from './generation.js';
import { BUILDING_PARTITION, buildingId, newBuildingId, parseCommand } from './partition.js';
import { postDifference, validateEconomy } from './economy.js';
import { BUILDING_POLICY as P } from './policy.js';
import { inspect } from './rules.js';
import { DEFAULT_BUILDING_SOUND_ENABLED } from '../settings.js';
export interface BuildingView {
    revision: number; active: Project | null; collection: Project[];
    inspection: ReturnType<typeof inspect> | null; balance: number; award: number;
    writeState: XiaobaiOsFileState; pending: boolean; ready: boolean; soundEnabled: boolean;
}
export interface BuildingRequest { actionId: string; revision: number; command: Command }
export function createBuildingService(store: PartitionStore<BuildingData>, files: XiaobaiOsFileControls, economy: EconomyReadCapability,
    dependencies: { generate?: typeof generateConstruction; seed?: () => number; draw?: () => StockKind[][]; id?: () => string; idle?: () => boolean; soundEnabled?: () => boolean } = {}) {
    function view(): BuildingView {
        const data = store.peekCurrent()?.value ?? emptyBuilding(), active = activeProject(data), receipt = data.receipts.find(r => r.runId === active?.id);
        return { revision: data.revision, active, collection: data.projects.filter(p => p.saved),
            inspection: active ? inspect(projectBlueprint(active), active.rooms) : null, balance: economy.getPlayerBalance(), award: receipt ? payout(receipt) : 0,
            writeState: files.getFileState(), pending: files.hasPendingCommit(BUILDING_PARTITION.key), ready: economy.isOpen(),
            soundEnabled: dependencies.soundEnabled?.() ?? DEFAULT_BUILDING_SOUND_ENABLED };
    }
    async function refresh() { await economy.refresh(); await store.read(); return view(); }
    async function act(input: BuildingRequest, guard: () => boolean): Promise<BuildingView> {
        buildingId(input.actionId); const command = parseCommand(input.command);
        if (!Number.isSafeInteger(input.revision) || input.revision < 0) { fault('invalid'); }
        const allowed = () => guard() && (dependencies.idle?.() ?? true);
        if (!allowed()) { fault('unavailable'); }
        const current = store.peekCurrent()?.value ?? emptyBuilding(), repeated = current.last?.id === input.actionId;
        if (!repeated && input.revision !== current.revision) { fault('stale'); }
        let prepared: PreparedBuilding | undefined;
        if (!repeated && command.type === 'start') {
            if (view().active?.state === 'building') { fault('active'); }
            if (view().balance < P.fee) { fault('funds'); }
            prepared = { id: buildingId((dependencies.id ?? newBuildingId)()),
                seed: await (dependencies.generate ?? generateConstruction)((dependencies.seed ?? (() => crypto.getRandomValues(new Uint32Array(1))[0]))()) };
            if (!allowed()) { fault('unavailable'); }
            prepared.offers = (dependencies.draw ?? drawOffers)();
        } else if (!repeated && command.type === 'choose') {
            const supply = activeProject(current)?.supply;
            if (!supply?.offers[command.choice]) { fault('supply'); }
            if (supply.remaining > 1) { prepared = { offers: (dependencies.draw ?? drawOffers)() }; }
        }
        let accepted = false;
        const result = await store.transact(transaction => {
            if (!allowed()) { fault('unavailable'); }
            const data = transaction.current ?? emptyBuilding(), money = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateEconomy(data, money);
            if (data.last?.id === input.actionId) { if (data.last.fingerprint !== JSON.stringify(command)) { fault('identity'); } return; }
            if (data.revision !== input.revision) { fault('stale'); }
            if (command.type === 'start' && money.getPlayerBalance() < P.fee) { fault('funds'); }
            const next = advance(data, command, input.actionId, prepared);
            postDifference(data, next, money); validateEconomy(next, money); transaction.replace(next); accepted = true;
        }, { retainFailedCandidate: true, commitGuard: () => (accepted || guard()) && (dependencies.idle?.() ?? true) });
        if (result.status !== 'confirmed' && result.status !== 'unchanged') { fault(`save_${result.status}`); }
        return view();
    }
    return { view, refresh, act,
        async confirm(guard: () => boolean) {
            if (files.hasPendingCommit() && !files.hasPendingCommit(BUILDING_PARTITION.key)) { fault('unavailable'); }
            const result = await files.retryPending({ beforeRetry: guard }); if (!guard()) { fault('unavailable'); }
            if (['confirmed', 'none', 'adopted'].includes(result.status)) { await refresh(); } return view();
        },
        subscribe(listener: () => void) { const stops = [store.subscribe(listener), economy.subscribe(listener), files.subscribeFileState(listener)]; return () => stops.forEach(stop => stop()); },
    };
}
export type BuildingService = ReturnType<typeof createBuildingService>;
