import type {
    CapabilityToken,
    CapabilityTransactionAccess,
    CapturedChatBinding,
    ChatReferencePort,
    KernelWriteFailure,
    PartitionRegistration,
    PartitionSnapshot,
    PendingCommitRecoveryResult,
    ScopedChatStore,
    ScopedTransaction,
    ScopedTransactionResult,
    SidecarRevision,
    StorageReplaceResult,
    TransactionOptions,
    XiaobaiOsFileState,
    XiaobaiOsFileStateChange,
    XiaobaiOsReferenceV1,
    XiaobaiOsSidecarV1,
    XiaobaiOsStoragePort,
} from './contracts.js';
import { cloneJsonValue, sameSidecarRevision, sidecarRevision } from './envelope.js';
import {
    createRegisteredPartitionInitial,
    parseRegisteredPartition,
    serializeRegisteredPartition,
    type XiaobaiOsPartitionRegistry,
} from './partition-registry.js';

export interface TransactionCapabilityBinder {
    bind<C>(
        token: CapabilityToken<C>,
        requesterId: string,
        access: CapabilityTransactionAccess,
    ): C;
}

export interface TransactionCandidateValidationContext {
    envelope: XiaobaiOsSidecarV1;
    changedPartitionKeys: ReadonlySet<string>;
}

export interface TransactionCoordinatorOptions {
    storage: XiaobaiOsStoragePort;
    partitions: XiaobaiOsPartitionRegistry;
    chatReferences: ChatReferencePort;
    capabilityBinder?: TransactionCapabilityBinder;
    validateCandidate?: (context: TransactionCandidateValidationContext) => void | Promise<void>;
    createId?: () => string;
    beforeRead?: () => Promise<void>;
    prepareInitialPartitions?: (
        capture: CapturedChatBinding,
        signal?: AbortSignal,
    ) => Promise<Record<string, unknown>>;
}

export interface ScopedStoreOptions {
    allowedCapabilities?: readonly CapabilityToken<unknown>[];
}

export interface TransactionCoordinator {
    createScopedStore<T>(
        registration: PartitionRegistration<T>,
        options?: ScopedStoreOptions,
    ): ScopedChatStore<T>;
    refresh(): Promise<void>;
    installResolvedEnvelope(envelope: XiaobaiOsSidecarV1 | null): Promise<void>;
    invalidateCurrent(): void;
    retryPending(): Promise<PendingCommitRecoveryResult>;
    adoptServerState(): Promise<PendingCommitRecoveryResult>;
    getFileState(): XiaobaiOsFileState;
    hasPendingCommit(partitionKey?: string): boolean;
    subscribeFileState(listener: (change: XiaobaiOsFileStateChange) => void): () => void;
}

interface PendingCommit {
    capture: CapturedChatBinding;
    expected: SidecarRevision | null;
    candidate: XiaobaiOsSidecarV1;
    preparedResult: unknown;
    owner: PartitionRegistration<unknown>;
    stage: 'replace' | 'reference';
    observed: XiaobaiOsSidecarV1 | null;
    retainFailedCandidate: boolean;
}

class KernelOperationError extends Error {
    constructor(
        readonly failure: KernelWriteFailure,
        options: { cause?: unknown } = {},
    ) {
        super(failure.message, options);
        this.name = 'KernelOperationError';
    }
}

function randomId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID().replace(/[^A-Za-z0-9_-]/g, '_');
    }
    const random = Math.random().toString(36).slice(2);
    return `${Date.now().toString(36)}_${random}`;
}

function writeFailure(code: string, message: string, retryable: boolean): KernelWriteFailure {
    return { code, message, retryable };
}

function asWriteFailure(error: unknown, fallbackCode: string): KernelWriteFailure {
    if (error instanceof KernelOperationError) { return error.failure; }
    if (
        error !== null
        && typeof error === 'object'
        && typeof (error as { code?: unknown }).code === 'string'
        && typeof (error as { message?: unknown }).message === 'string'
    ) {
        return writeFailure(
            (error as { code: string }).code,
            (error as { message: string }).message,
            (error as { retryable?: unknown }).retryable === true,
        );
    }
    return writeFailure(
        fallbackCode,
        error instanceof Error ? error.message : 'Xiaobai OS operation failed',
        false,
    );
}

function isKernelFailure(error: unknown, code: string): boolean {
    return error instanceof KernelOperationError && error.failure.code === code;
}

function frozenFailure(state: XiaobaiOsFileState): KernelWriteFailure {
    return state === 'conflict'
        ? writeFailure('storage_conflict', 'Sidecar conflicts with the server; resolve it before writing', false)
        : writeFailure('storage_unconfirmed', 'A previous sidecar write is still unconfirmed', true);
}

function clonePartitionValue<T>(registration: PartitionRegistration<T>, value: T): T {
    return parseRegisteredPartition(registration, serializeRegisteredPartition(registration, value));
}

function sameBinding(left: CapturedChatBinding, right: CapturedChatBinding): boolean {
    return left.identityKey === right.identityKey
        && left.binding.kind === right.binding.kind
        && left.binding.ownerLocator === right.binding.ownerLocator
        && left.binding.chatId === right.binding.chatId;
}

export function createTransactionCoordinator(options: TransactionCoordinatorOptions): TransactionCoordinator {
    const { storage, partitions, chatReferences } = options;
    if (!storage || !partitions || !chatReferences) {
        throw new TypeError('transaction coordinator requires storage, partitions and chat references');
    }
    const createId = options.createId ?? randomId;
    let queue: Promise<unknown> = Promise.resolve();
    const states = new Map<string, XiaobaiOsFileState>();
    const stateErrors = new Map<string, KernelWriteFailure>();
    const envelopes = new Map<string, XiaobaiOsSidecarV1 | null>();
    const pending = new Map<string, PendingCommit>();
    const stateListeners = new Set<(change: XiaobaiOsFileStateChange) => void>();
    const partitionListeners = new Map<string, Set<(snapshot: PartitionSnapshot<unknown>) => void>>();
    let activeIdentity: string | null = null;
    let activation = 0;

    function enqueue<T>(work: () => Promise<T>): Promise<T> {
        const result = queue.then(work, work);
        queue = result.catch(() => undefined);
        return result;
    }

    function requireCapture(): CapturedChatBinding {
        const capture = chatReferences.capture();
        if (!capture) {
            throw new KernelOperationError(writeFailure('chat_unavailable', 'No chat is currently open', false));
        }
        if (activeIdentity !== capture.identityKey) {
            activation += 1;
            for (const key of envelopes.keys()) { if (!pending.has(key)) { envelopes.delete(key); } }
            activeIdentity = capture.identityKey;
        }
        if (envelopes.has(capture.identityKey)
            && (envelopes.get(capture.identityKey)?.osId ?? null) !== (capture.reference?.osId ?? null)
            && !pending.has(capture.identityKey)) {
            envelopes.delete(capture.identityKey);
        }
        return capture;
    }

    async function captureForOperation(): Promise<CapturedChatBinding> {
        const requested = requireCapture();
        await options.beforeRead?.();
        const current = requireCapture();
        if (!sameBinding(requested, current)) {
            throw new KernelOperationError(writeFailure('chat_changed', 'The active chat changed while loading', true));
        }
        return current;
    }

    async function assertCurrent(capture: CapturedChatBinding): Promise<void> {
        const current = chatReferences.capture();
        if (!current || !sameBinding(capture, current) || !await chatReferences.isCurrent(capture)) {
            throw new KernelOperationError(writeFailure('chat_changed', 'The active chat changed during the operation', true));
        }
    }

    function setState(identityKey: string, state: XiaobaiOsFileState, error?: KernelWriteFailure): void {
        const previous = states.get(identityKey) ?? 'ready';
        const previousError = stateErrors.get(identityKey);
        if (state === 'ready') { states.delete(identityKey); } else { states.set(identityKey, state); }
        if (error) { stateErrors.set(identityKey, error); } else { stateErrors.delete(identityKey); }
        if (previous === state && previousError?.code === error?.code && previousError?.message === error?.message) { return; }
        const change: XiaobaiOsFileStateChange = error
            ? { identityKey, state, error }
            : { identityKey, state };
        for (const listener of stateListeners) {
            try { listener(change); } catch (listenerError) {
                console.error('[LittleWhiteBox] 小白 OS 文件状态监听失败', listenerError);
            }
        }
    }

    function stateFor(capture: CapturedChatBinding): XiaobaiOsFileState {
        return states.get(capture.identityKey) ?? 'ready';
    }

    function pendingFailure(capture: CapturedChatBinding): KernelWriteFailure {
        return stateErrors.get(capture.identityKey)
            ?? writeFailure('storage_pending', 'A prepared sidecar candidate is waiting to be retried', true);
    }

    async function strongRead(capture: CapturedChatBinding): Promise<XiaobaiOsSidecarV1 | null> {
        if (!capture.reference) { return null; }
        const envelope = await storage.read(capture.reference.osId);
        assertResolvedEnvelope(capture, envelope);
        return envelope;
    }

    async function readConfirmed(capture: CapturedChatBinding): Promise<XiaobaiOsSidecarV1 | null> {
        if (envelopes.has(capture.identityKey)) { return envelopes.get(capture.identityKey) ?? null; }
        const requestedAt = activation;
        const envelope = await strongRead(capture);
        await assertCurrent(capture);
        if (requestedAt !== activation) {
            throw new KernelOperationError(writeFailure('chat_changed', 'The chat was reloaded during the read', true));
        }
        installEnvelope(capture, envelope);
        return envelope;
    }

    function assertResolvedEnvelope(
        capture: CapturedChatBinding,
        envelope: XiaobaiOsSidecarV1 | null,
    ): void {
        if (!envelope) {
            if (!capture.reference) { return; }
            throw new KernelOperationError(
                writeFailure('storage_missing', 'The chat references a missing Xiaobai OS sidecar', true),
            );
        }
        if (!capture.reference || envelope.osId !== capture.reference.osId) {
            throw new KernelOperationError(
                writeFailure('storage_identity_mismatch', 'The sidecar identity does not match the chat reference', false),
            );
        }
        if (
            envelope.binding.kind !== capture.binding.kind
            || envelope.binding.ownerLocator !== capture.binding.ownerLocator
            || envelope.binding.chatId !== capture.binding.chatId
        ) {
            throw new KernelOperationError(
                writeFailure('storage_binding_mismatch', 'The sidecar binding does not match the active chat', false),
            );
        }
    }

    function snapshotFromEnvelope<T>(
        registration: PartitionRegistration<T>,
        identityKey: string,
        envelope: XiaobaiOsSidecarV1 | null,
    ): PartitionSnapshot<T> {
        if (!envelope || !Object.hasOwn(envelope.partitions, registration.key)) {
            return {
                identityKey,
                osId: envelope?.osId ?? null,
                envelopeRevision: envelope?.revision ?? null,
                value: null,
            };
        }
        const value = parseRegisteredPartition(registration, envelope.partitions[registration.key]);
        return {
            identityKey,
            osId: envelope.osId,
            envelopeRevision: envelope.revision,
            value: clonePartitionValue(registration, value),
        };
    }

    function publishPartition(key: string, identityKey: string, envelope: XiaobaiOsSidecarV1 | null): void {
        const registration = partitions.get<unknown>(key);
        if (!registration) { return; }
        let snapshot: PartitionSnapshot<unknown>;
        try {
            snapshot = snapshotFromEnvelope(registration, identityKey, envelope);
        } catch {
            return;
        }
        for (const listener of partitionListeners.get(key) ?? []) {
            try { listener(snapshot); } catch (listenerError) {
                console.error(`[LittleWhiteBox] 分区 ${key} 状态监听失败`, listenerError);
            }
        }
    }

    function installEnvelope(capture: CapturedChatBinding, envelope: XiaobaiOsSidecarV1 | null): void {
        const current = chatReferences.capture();
        if (!current || !sameBinding(capture, current)) { return; }
        envelopes.set(capture.identityKey, envelope ? cloneJsonValue(envelope) : null);
        for (const registration of partitions.list()) {
            publishPartition(registration.key, capture.identityKey, envelope);
        }
    }

    async function readForStore<T>(
        requested: CapturedChatBinding,
        registration: PartitionRegistration<T>,
    ): Promise<PartitionSnapshot<T>> {
        return await enqueue(async () => {
            await assertCurrent(requested);
            const frozenState = stateFor(requested);
            const isFrozen = frozenState === 'unconfirmed'
                || frozenState === 'conflict'
                || pending.has(requested.identityKey);
            if (!isFrozen && !envelopes.has(requested.identityKey)) { setState(requested.identityKey, 'loading'); }
            let envelope: XiaobaiOsSidecarV1 | null;
            try {
                envelope = await readConfirmed(requested);
                await assertCurrent(requested);
                if (!isFrozen) { setState(requested.identityKey, 'ready'); }
            } catch (error) {
                const failure = asWriteFailure(error, 'storage_read_failed');
                if (!isFrozen) { setState(requested.identityKey, 'failed', failure); }
                throw error;
            }
            return snapshotFromEnvelope(registration, requested.identityKey, envelope);
        });
    }

    async function cleanupUnreferencedSidecar(capture: CapturedChatBinding, osId: string): Promise<void> {
        try {
            await storage.delete(osId);
        } catch (deleteError) {
            try {
                void Promise.resolve(chatReferences.recordOrphan?.(osId, capture.binding)).catch(error => {
                    console.error('[LittleWhiteBox] 小白 OS 孤儿 sidecar 索引登记失败', error);
                });
            } catch (error) {
                console.error('[LittleWhiteBox] 小白 OS 孤儿 sidecar 索引登记失败', error, deleteError);
            }
        }
    }

    async function installInitialReference(
        entry: PendingCommit,
    ): Promise<'confirmed' | 'failed' | 'unconfirmed'> {
        const reference: XiaobaiOsReferenceV1 = { formatVersion: 1, osId: entry.candidate.osId };
        const result = await chatReferences.install(entry.capture, reference);
        if (result.status === 'confirmed') {
            try {
                void Promise.resolve(
                    chatReferences.recordReference?.(entry.candidate.osId, entry.capture.binding),
                ).catch(error => {
                    console.error('[LittleWhiteBox] 小白 OS sidecar 索引登记失败', error);
                });
            } catch (error) {
                console.error('[LittleWhiteBox] 小白 OS sidecar 索引登记失败', error);
            }
            installEnvelope(entry.capture, entry.candidate);
            pending.delete(entry.capture.identityKey);
            setState(entry.capture.identityKey, 'ready');
            return 'confirmed';
        }
        if (result.status === 'unconfirmed') {
            entry.stage = 'reference';
            pending.set(entry.capture.identityKey, entry);
            setState(entry.capture.identityKey, 'unconfirmed', result.error);
            return 'unconfirmed';
        }
        await cleanupUnreferencedSidecar(entry.capture, entry.candidate.osId);
        if (entry.retainFailedCandidate) {
            entry.stage = 'replace';
            pending.set(entry.capture.identityKey, entry);
            setState(entry.capture.identityKey, 'failed', result.error);
        } else {
            pending.delete(entry.capture.identityKey);
            setState(entry.capture.identityKey, 'ready');
        }
        return 'failed';
    }

    async function acceptConfirmed(entry: PendingCommit): Promise<'confirmed' | 'failed' | 'unconfirmed'> {
        if (!entry.capture.reference) {
            return await installInitialReference(entry);
        }
        installEnvelope(entry.capture, entry.candidate);
        pending.delete(entry.capture.identityKey);
        setState(entry.capture.identityKey, 'ready');
        return 'confirmed';
    }

    function savePending(entry: PendingCommit, result: StorageReplaceResult): void {
        entry.stage = 'replace';
        entry.observed = result.status === 'unconfirmed' || result.status === 'conflict' ? result.observed : null;
        pending.set(entry.capture.identityKey, entry);
        setState(
            entry.capture.identityKey,
            result.status === 'conflict' ? 'conflict' : 'unconfirmed',
            result.status === 'conflict'
                ? writeFailure('storage_conflict', 'The sidecar changed while this write was in flight', false)
                : writeFailure('storage_unconfirmed', 'The sidecar write result could not be confirmed', true),
        );
    }

    function createScopedStore<T>(
        registration: PartitionRegistration<T>,
        storeOptions: ScopedStoreOptions = {},
    ): ScopedChatStore<T> {
        partitions.assertRegistered(registration);
        const allowedTokens = new Map(
            (storeOptions.allowedCapabilities ?? []).map(token => [token.id, token] as const),
        );

        function peekCurrent(): PartitionSnapshot<T> | null {
            if (!chatReferences.capture()) { return null; }
            const capture = requireCapture();
            if (!envelopes.has(capture.identityKey)) { return null; }
            return snapshotFromEnvelope(
                registration,
                capture.identityKey,
                envelopes.get(capture.identityKey) ?? null,
            );
        }

        async function read(): Promise<PartitionSnapshot<T>> {
            return await readForStore(await captureForOperation(), registration);
        }

        async function transact<R>(
            command: (context: ScopedTransaction<T>) => R | Promise<R>,
            transactionOptions: TransactionOptions = {},
        ): Promise<ScopedTransactionResult<T, R>> {
            if (typeof command !== 'function') { throw new TypeError('transaction command must be a function'); }
            const requested = await captureForOperation();
            return await enqueue(async () => {
                await assertCurrent(requested);
                const frozenState = stateFor(requested);
                if (frozenState === 'unconfirmed' || frozenState === 'conflict') {
                    return { status: 'failed', error: frozenFailure(frozenState) };
                }
                if (pending.has(requested.identityKey)) {
                    return { status: 'failed', error: pendingFailure(requested) };
                }
                if (transactionOptions.signal?.aborted) {
                    return {
                        status: 'failed',
                        error: writeFailure('transaction_aborted', 'Transaction was cancelled before it started', false),
                    };
                }

                let envelope: XiaobaiOsSidecarV1 | null;
                let initialPartitions: Record<string, unknown> = {};
                if (!envelopes.has(requested.identityKey)) { setState(requested.identityKey, 'loading'); }
                try {
                    envelope = await readConfirmed(requested);
                    if (!envelope && !requested.reference && options.prepareInitialPartitions) {
                        initialPartitions = cloneJsonValue(
                            await options.prepareInitialPartitions(requested, transactionOptions.signal),
                        );
                    }
                    await assertCurrent(requested);
                    setState(requested.identityKey, 'ready');
                } catch (error) {
                    const failure = asWriteFailure(error, 'storage_read_failed');
                    setState(requested.identityKey, 'failed', failure);
                    return { status: 'failed', error: failure };
                }

                const parsedValues = new Map<string, unknown>();
                const replacements = new Map<string, unknown>();
                const capabilities = new Map<string, unknown>();
                const readPartition = <P>(target: PartitionRegistration<P>): P | null => {
                    partitions.assertRegistered(target);
                    if (replacements.has(target.key)) {
                        return clonePartitionValue(target, replacements.get(target.key) as P);
                    }
                    if (parsedValues.has(target.key)) {
                        return clonePartitionValue(target, parsedValues.get(target.key) as P);
                    }
                    const sourcePartitions = envelope?.partitions ?? initialPartitions;
                    if (!Object.hasOwn(sourcePartitions, target.key)) { return null; }
                    const parsed = parseRegisteredPartition(target, sourcePartitions[target.key]);
                    parsedValues.set(target.key, parsed);
                    return clonePartitionValue(target, parsed);
                };
                const replacePartition = <P>(target: PartitionRegistration<P>, value: P): void => {
                    partitions.assertRegistered(target);
                    // Serialize now so mutations after replace cannot alter the prepared candidate.
                    const serialized = serializeRegisteredPartition(target, value);
                    replacements.set(target.key, parseRegisteredPartition(target, serialized));
                };
                const current = readPartition(registration);
                const access: CapabilityTransactionAccess = { readPartition, replacePartition };
                const context: ScopedTransaction<T> = {
                    current,
                    currentOrInitial: () => current === null
                        ? createRegisteredPartitionInitial(registration)
                        : clonePartitionValue(registration, current),
                    replace: next => replacePartition(registration, next),
                    useCapability: <C>(token: CapabilityToken<C>): C => {
                        if (!allowedTokens.has(token.id)) {
                            throw new KernelOperationError(
                                writeFailure(
                                    'capability_not_authorized',
                                    `${registration.ownerId} did not declare capability ${token.id}`,
                                    false,
                                ),
                            );
                        }
                        if (!options.capabilityBinder) {
                            throw new KernelOperationError(
                                writeFailure('capability_unavailable', `Capability ${token.id} is unavailable`, false),
                            );
                        }
                        if (!capabilities.has(token.id)) {
                            capabilities.set(
                                token.id,
                                options.capabilityBinder.bind(token, registration.ownerId, access),
                            );
                        }
                        return capabilities.get(token.id) as C;
                    },
                };

                let result: R;
                try {
                    result = await command(context);
                } catch (error) {
                    setState(requested.identityKey, 'ready');
                    throw error;
                }
                if (replacements.size === 0) {
                    return { status: 'unchanged', result };
                }
                if (transactionOptions.signal?.aborted || transactionOptions.commitGuard && !await transactionOptions.commitGuard()) {
                    return {
                        status: 'failed',
                        error: writeFailure('commit_guard_rejected', 'Transaction was no longer current at commit time', false),
                    };
                }
                try {
                    await assertCurrent(requested);
                } catch (error) {
                    return { status: 'failed', error: asWriteFailure(error, 'chat_changed') };
                }

                const osId = envelope?.osId ?? createId();
                const candidatePartitions: Record<string, unknown> = envelope
                    ? cloneJsonValue(envelope.partitions)
                    : cloneJsonValue(initialPartitions);
                for (const [key, value] of replacements) {
                    const target = partitions.require<unknown>(key);
                    candidatePartitions[key] = serializeRegisteredPartition(target, value);
                }
                const candidate: XiaobaiOsSidecarV1 = {
                    formatVersion: 1,
                    osId,
                    binding: { ...requested.binding },
                    revision: envelope ? envelope.revision + 1 : 0,
                    commitId: createId(),
                    partitions: candidatePartitions,
                };
                try {
                    await options.validateCandidate?.({
                        envelope: cloneJsonValue(candidate),
                        changedPartitionKeys: new Set(replacements.keys()),
                    });
                } catch (error) {
                    return { status: 'failed', error: asWriteFailure(error, 'candidate_invariant_failed') };
                }
                const entry: PendingCommit = {
                    capture: requested,
                    expected: envelope ? sidecarRevision(envelope) : null,
                    candidate: cloneJsonValue(candidate),
                    preparedResult: result,
                    owner: registration as PartitionRegistration<unknown>,
                    stage: 'replace',
                    observed: null,
                    retainFailedCandidate: transactionOptions.retainFailedCandidate === true,
                };
                setState(requested.identityKey, 'saving');
                let replaceResult: StorageReplaceResult;
                try {
                    replaceResult = await storage.replace({ expected: entry.expected, candidate: entry.candidate }, transactionOptions.signal);
                } catch (error) {
                    const failure = asWriteFailure(error, 'storage_write_failed');
                    if (entry.retainFailedCandidate) {
                        pending.set(requested.identityKey, entry);
                        setState(requested.identityKey, 'failed', failure);
                    } else {
                        setState(requested.identityKey, 'ready');
                    }
                    return { status: 'failed', error: failure };
                }
                if (replaceResult.status === 'failed') {
                    if (entry.retainFailedCandidate) {
                        pending.set(requested.identityKey, entry);
                        setState(requested.identityKey, 'failed', replaceResult.error);
                    } else {
                        setState(requested.identityKey, 'ready');
                    }
                    return { status: 'failed', error: replaceResult.error };
                }
                if (replaceResult.status === 'unconfirmed' || replaceResult.status === 'conflict') {
                    savePending(entry, replaceResult);
                    return replaceResult.status === 'conflict'
                        ? { status: 'conflict', preparedResult: result }
                        : { status: 'unconfirmed', preparedResult: result, commitId: candidate.commitId };
                }
                const accepted = await acceptConfirmed(entry);
                if (accepted === 'confirmed') {
                    return {
                        status: 'confirmed',
                        result,
                        snapshot: snapshotFromEnvelope(registration, requested.identityKey, candidate),
                    };
                }
                if (accepted === 'unconfirmed') {
                    return { status: 'unconfirmed', preparedResult: result, commitId: candidate.commitId };
                }
                return {
                    status: 'failed',
                    error: writeFailure('reference_install_failed', 'The sidecar was saved but its chat reference was not', true),
                };
            });
        }

        function subscribe(listener: (snapshot: PartitionSnapshot<T>) => void): () => void {
            if (typeof listener !== 'function') { throw new TypeError('partition listener must be a function'); }
            let listeners = partitionListeners.get(registration.key);
            if (!listeners) {
                listeners = new Set();
                partitionListeners.set(registration.key, listeners);
            }
            const untyped = listener as (snapshot: PartitionSnapshot<unknown>) => void;
            listeners.add(untyped);
            return () => {
                listeners?.delete(untyped);
                if (listeners?.size === 0) { partitionListeners.delete(registration.key); }
            };
        }

        return Object.freeze({ peekCurrent, read, transact, subscribe });
    }

    async function refresh(): Promise<void> {
        const requested = requireCapture();
        await enqueue(async () => {
            await assertCurrent(requested);
            const frozenState = stateFor(requested);
            const isFrozen = frozenState === 'unconfirmed'
                || frozenState === 'conflict'
                || pending.has(requested.identityKey);
            if (isFrozen) { return; }
            setState(requested.identityKey, 'loading');
            try {
                const envelope = await strongRead(requested);
                await assertCurrent(requested);
                installEnvelope(requested, envelope);
                setState(requested.identityKey, 'ready');
            } catch (error) {
                const failure = asWriteFailure(error, 'storage_read_failed');
                setState(requested.identityKey, 'failed', failure);
                throw error;
            }
        });
    }

    async function installResolvedEnvelope(envelope: XiaobaiOsSidecarV1 | null): Promise<void> {
        const requested = requireCapture();
        await enqueue(async () => {
            try {
                await assertCurrent(requested);
            } catch (error) {
                if (isKernelFailure(error, 'chat_changed')) { return; }
                throw error;
            }
            const frozenState = stateFor(requested);
            const isFrozen = frozenState === 'unconfirmed'
                || frozenState === 'conflict'
                || pending.has(requested.identityKey);
            if (!isFrozen) { setState(requested.identityKey, 'loading'); }
            try {
                assertResolvedEnvelope(requested, envelope);
                await assertCurrent(requested);
                if (isFrozen) { return; }
                const installed = envelopes.get(requested.identityKey);
                if (
                    installed
                    && envelope
                    && installed.osId === envelope.osId
                    && installed.revision > envelope.revision
                ) {
                    setState(requested.identityKey, 'ready');
                    return;
                }
                installEnvelope(requested, envelope);
                setState(requested.identityKey, 'ready');
            } catch (error) {
                if (isKernelFailure(error, 'chat_changed')) { return; }
                const failure = asWriteFailure(error, 'storage_read_failed');
                if (!isFrozen) { setState(requested.identityKey, 'failed', failure); }
                throw error;
            }
        });
    }

    function invalidateCurrent(): void {
        activation += 1;
        for (const key of envelopes.keys()) { if (!pending.has(key)) { envelopes.delete(key); } }
        activeIdentity = null;
        const capture = chatReferences.capture();
        if (!capture) { return; }
        for (const registration of partitions.list()) {
            publishPartition(registration.key, capture.identityKey, null);
        }
    }

    async function retryPending(): Promise<PendingCommitRecoveryResult> {
        const requested = requireCapture();
        return await enqueue(async () => {
            const entry = pending.get(requested.identityKey);
            if (!entry) { return { status: 'none' }; }
            await assertCurrent(entry.capture);
            if (entry.stage === 'reference') {
                const installed = await installInitialReference(entry);
                if (installed === 'confirmed') { return { status: 'confirmed' }; }
                if (installed === 'unconfirmed') { return { status: 'unconfirmed' }; }
                return {
                    status: 'failed',
                    error: writeFailure('reference_install_failed', 'Could not install the sidecar chat reference', true),
                };
            }

            let observed: XiaobaiOsSidecarV1 | null;
            try {
                observed = await storage.read(entry.candidate.osId);
            } catch (error) {
                const failure = asWriteFailure(error, 'storage_read_failed');
                setState(entry.capture.identityKey, 'unconfirmed', failure);
                return { status: 'unconfirmed', error: failure };
            }
            if (observed?.commitId === entry.candidate.commitId) {
                const accepted = await acceptConfirmed(entry);
                return { status: accepted };
            }
            if (!sameSidecarRevision(entry.expected, observed)) {
                entry.observed = observed;
                pending.set(entry.capture.identityKey, entry);
                setState(entry.capture.identityKey, 'conflict', frozenFailure('conflict'));
                return { status: 'conflict' };
            }
            setState(entry.capture.identityKey, 'saving');
            let result: StorageReplaceResult;
            try {
                result = await storage.replace({ expected: entry.expected, candidate: entry.candidate });
            } catch (error) {
                const failure = asWriteFailure(error, 'storage_write_failed');
                setState(entry.capture.identityKey, 'failed', failure);
                return { status: 'failed', error: failure };
            }
            if (result.status === 'confirmed') {
                const accepted = await acceptConfirmed(entry);
                return { status: accepted };
            }
            if (result.status === 'failed') {
                setState(entry.capture.identityKey, 'failed', result.error);
                return { status: 'failed', error: result.error };
            }
            savePending(entry, result);
            return { status: result.status };
        });
    }

    async function adoptServerState(): Promise<PendingCommitRecoveryResult> {
        const requested = requireCapture();
        return await enqueue(async () => {
            const entry = pending.get(requested.identityKey);
            if (!entry) { return { status: 'none' }; }
            await assertCurrent(entry.capture);
            let observed: XiaobaiOsSidecarV1 | null;
            try {
                observed = await storage.read(entry.candidate.osId);
            } catch (error) {
                const failure = asWriteFailure(error, 'storage_read_failed');
                setState(entry.capture.identityKey, 'conflict', failure);
                return { status: 'conflict', error: failure };
            }
            if (!observed) {
                const failure = writeFailure('storage_missing', 'No server sidecar is available to adopt', true);
                setState(entry.capture.identityKey, 'conflict', failure);
                return { status: 'conflict', error: failure };
            }
            if (!entry.capture.reference) {
                entry.candidate = observed;
                const installed = await installInitialReference(entry);
                return installed === 'confirmed' ? { status: 'adopted' } : { status: installed };
            }
            installEnvelope(entry.capture, observed);
            pending.delete(entry.capture.identityKey);
            setState(entry.capture.identityKey, 'ready');
            return { status: 'adopted' };
        });
    }

    function getFileState(): XiaobaiOsFileState {
        const capture = chatReferences.capture();
        return capture ? stateFor(capture) : 'ready';
    }

    function hasPendingCommit(partitionKey?: string): boolean {
        const capture = chatReferences.capture();
        if (!capture) { return false; }
        const entry = pending.get(capture.identityKey);
        return !!entry && (!partitionKey || entry.owner.key === partitionKey);
    }

    function subscribeFileState(listener: (change: XiaobaiOsFileStateChange) => void): () => void {
        if (typeof listener !== 'function') { throw new TypeError('file state listener must be a function'); }
        stateListeners.add(listener);
        return () => stateListeners.delete(listener);
    }

    return Object.freeze({
        createScopedStore,
        refresh,
        installResolvedEnvelope,
        invalidateCurrent,
        retryPending,
        adoptServerState,
        getFileState,
        hasPendingCommit,
        subscribeFileState,
    });
}
