import type { BuildingRequest } from './service.js';
import { parseCommand, buildingId } from './partition.js';
import { fault } from './domain.js';
export interface PendingIntent { runId: string; request: BuildingRequest }
export interface RetiredIntent { runId: string; revision: number; retired: true }
export interface RecoveryJournal { read(): PendingIntent | RetiredIntent | null; write(intent: PendingIntent): void; clear(): void }
const KEY = 'LittleWhiteBox:building:pending';
const FORMAT = 5;
/** One unresolved intent, not another save-game. Survives a full Host restart; matched by unique paid run ID. */
export function createRecoveryJournal(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): RecoveryJournal {
    return {
        read() {
            try {
                const raw = storage.getItem(KEY); if (raw === null) { return null; }
                const value = JSON.parse(raw) as PendingIntent & { format?: number };
                const runId = buildingId(value.runId), actionId = buildingId(value.request.actionId);
                const revision = value.request.revision;
                if (!Number.isSafeInteger(revision) || revision < 0) { fault('recovery'); }
                // V1–v4 intents used manual infrastructure, flat coordinates or a different supply schedule. Confirm storage first,
                // then retire them explicitly; never reinterpret or recharge an old action.
                if (value.format === undefined || value.format === 2 || value.format === 3 || value.format === 4) { return { runId, revision, retired: true }; }
                if (value.format !== FORMAT) { fault('recovery'); }
                const command = parseCommand(value.request.command);
                if (!Number.isSafeInteger(revision) || revision < 0 || command.type === 'start') { fault('recovery'); }
                return { runId, request: { actionId, revision, command } };
            } catch { return fault('recovery'); }
        },
        write(intent) { try { storage.setItem(KEY, JSON.stringify({ format: FORMAT, ...intent })); } catch { fault('recovery'); } },
        clear() { try { storage.removeItem(KEY); } catch { fault('recovery'); } },
    };
}
