import type { TavernManagerRunRecord } from './session-db';

export const TAVERN_MANAGER_HEARTBEAT_INTERVAL_MS = 4000;
export const TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS = 30000;

export function isTavernManagerRunLiveStatus(status = ''): boolean {
    return ['queued', 'running'].includes(String(status || ''));
}

export function isTavernManagerRunActive(
    run: Pick<TavernManagerRunRecord, 'status' | 'createdAt' | 'updatedAt' | 'leaseExpiresAt'> | null | undefined,
    observedAt = Date.now(),
): boolean {
    if (!run || !isTavernManagerRunLiveStatus(run.status)) {return false;}
    if (run.status === 'queued') {return true;}
    const leaseExpiresAt = Number(run.leaseExpiresAt) || 0;
    if (leaseExpiresAt) {return leaseExpiresAt > Number(observedAt);}
    const lastActivityAt = Number(run.updatedAt) || Number(run.createdAt) || 0;
    if (!lastActivityAt) {return false;}
    return Math.max(0, Number(observedAt) - lastActivityAt) <= TAVERN_MANAGER_HEARTBEAT_TIMEOUT_MS;
}
