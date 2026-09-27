import type {
    PendingCommitRecoveryResult,
    PartitionStore,
    XiaobaiOsFileState,
} from '../../../kernel/contracts.js';
import type { TransactionCoordinator } from '../../../kernel/transaction-coordinator.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import { parseMapDomain } from '../../../domains/map/invariants.js';
import { createEmptyMapDomain } from '../../../domains/map/state.js';
import type { MapDomainV1 } from '../../../domains/map/types.js';

export interface MapServiceView {
    map: MapDomainV1 | null;
    writeState: XiaobaiOsFileState;
}

export interface MapMutationOptions {
    expectedRevision: number;
    beforeCommit?: () => void | Promise<void>;
}

export interface MapService {
    readCurrent(): MapServiceView;
    refreshCurrent(): Promise<MapServiceView>;
    replaceCurrent(candidate: unknown, options: MapMutationOptions): Promise<MapServiceView>;
    confirmPending(guard?: () => boolean): Promise<PendingCommitRecoveryResult>;
    adoptServerState(): Promise<PendingCommitRecoveryResult>;
    getWriteState(): XiaobaiOsFileState;
    subscribe(listener: () => void): () => void;
    dispose(): void;
}

export class MapRevisionConflictError extends Error {
    readonly code = 'map_revision_conflict' as const;

    constructor() {
        super('map_revision_conflict');
        this.name = 'MapRevisionConflictError';
    }
}

function sameMapContent(left: MapDomainV1, right: MapDomainV1): boolean {
    return jsonValuesEqual(
        { schemaVersion: left.schemaVersion, atlas: left.atlas, scenes: left.scenes },
        { schemaVersion: right.schemaVersion, atlas: right.atlas, scenes: right.scenes },
    );
}

function transactionError(result: { status: string; error?: { code: string; message: string; retryable: boolean } }): Error {
    return Object.assign(new Error(result.error?.message || `map_${result.status}`), {
        code: result.error?.code || (result.status === 'unconfirmed' ? 'SAVE_UNCONFIRMED' : 'SAVE_CONFLICT'),
        retryable: result.error?.retryable ?? true,
        uncertain: result.status === 'unconfirmed',
    });
}

export function createMapService(
    store: PartitionStore<MapDomainV1>,
    files: Pick<
        TransactionCoordinator,
        'retryPending' | 'adoptServerState' | 'getFileState' | 'subscribeFileState'
    >,
): MapService {
    const listeners = new Set<() => void>();
    const publish = (): void => {
        for (const listener of listeners) {
            try { listener(); } catch (error) {
                console.error('[LittleWhiteBox] Map state listener failed', error);
            }
        }
    };
    const unsubscribeStore = store.subscribe(publish);
    const unsubscribeFiles = files.subscribeFileState(publish);
    const currentMap = (): MapDomainV1 | null => store.peekCurrent()?.value ?? null;

    function buildView(map = currentMap()): MapServiceView {
        return { map: map ? structuredClone(map) : null, writeState: files.getFileState() };
    }

    async function refreshCurrent(): Promise<MapServiceView> {
        await store.read();
        return buildView();
    }

    async function replaceCurrent(
        candidate: unknown,
        { expectedRevision, beforeCommit }: MapMutationOptions,
    ): Promise<MapServiceView> {
        const replacement = parseMapDomain(candidate);
        const result = await store.transact(transaction => {
            const current = transaction.current;
            if ((current?.revision ?? 0) !== expectedRevision) { throw new MapRevisionConflictError(); }
            const base = current ?? createEmptyMapDomain();
            if (sameMapContent(base, replacement)) { return current; }
            const next = parseMapDomain({ ...replacement, revision: base.revision + 1 });
            transaction.replace(next);
            return next;
        }, {
            commitGuard: beforeCommit
                ? async () => { await beforeCommit(); return true; }
                : undefined,
        });
        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw transactionError(result);
        }
        return buildView(result.status === 'confirmed' ? result.snapshot.value : result.result);
    }

    return Object.freeze({
        readCurrent: () => buildView(),
        refreshCurrent,
        replaceCurrent,
        confirmPending: (guard?: () => boolean) => files.retryPending({ beforeRetry: guard }),
        adoptServerState: () => files.adoptServerState(),
        getWriteState: () => files.getFileState(),
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose() {
            unsubscribeStore();
            unsubscribeFiles();
            listeners.clear();
        },
    });
}
