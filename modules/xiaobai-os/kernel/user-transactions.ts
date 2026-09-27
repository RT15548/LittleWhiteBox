import type { CapabilityToken, CapabilityTransactionAccess, CapturedChatBinding, ChatReferencePort, JsonUserFilePort, KernelWriteFailure, PartitionRegistration,
    PartitionSnapshot, PartitionStore, PendingCommitRecoveryOptions, PendingCommitRecoveryResult, ScopedTransaction,
    ScopedTransactionResult, TransactionOptions, XiaobaiOsFileControls, XiaobaiOsFileState, XiaobaiOsFileStateChange } from './contracts.js';
import { cloneJsonValue } from './envelope.js';
import { createStorageId } from './identity.js';
import { preparePartitionCommand } from './partition-command.js';
import { parseRegisteredPartition, serializeRegisteredPartition, type XiaobaiOsPartitionRegistry } from './partition-registry.js';
import type { TransactionCapabilityBinder } from './transaction-coordinator.js';
import { parseUserDocument, sameUserDocument, USER_DOCUMENT_FILENAME, type UserDocument } from './user-document.js';

export interface UserTransactions extends XiaobaiOsFileControls {
    prepare(): Promise<void>;
    createStore<T>(registration: PartitionRegistration<T>, allowedCapabilities?: readonly CapabilityToken<unknown>[]): PartitionStore<T>;
    /** Owner-only cross-story access; all changes and economy legs share one user-file commit. */
    transactOwned<T, R>(registration: PartitionRegistration<T>, capabilities: readonly CapabilityToken<unknown>[],
        command: (access: OwnedStoryAccess<T>) => R | Promise<R>): Promise<OwnedStoryResult<R>>;
    peekOwnedStories<T>(registration: PartitionRegistration<T>): ReadonlyArray<{ scopeId: string; value: T }>;
}

export interface OwnedStoryAccess<T> {
    global(): unknown;
    stories(): ReadonlyArray<{ scopeId: string; raw: unknown }>;
    replaceGlobal(value: T): void;
    replaceStory(scopeId: string, value: T | null): void;
    useCapability<C>(scopeId: string, token: CapabilityToken<C>): C;
}

export type OwnedStoryResult<R> =
    | { status: 'unchanged' | 'confirmed'; result: R }
    | { status: 'failed' | 'conflict' | 'unconfirmed'; error?: KernelWriteFailure };

interface Pending {
    expected: UserDocument | null;
    candidate: UserDocument;
    owner: string;
    retain: boolean;
    commitGuard?: () => boolean | Promise<boolean>;
    onSettled?: NonNullable<TransactionOptions['onSettled']>;
    discardRejectedCandidate?: boolean;
}

const USER_IDENTITY = 'user';
const failure = (code: string, message: string): KernelWriteFailure => ({ code, message, retryable: true });
const blocked = () => failure('storage_unconfirmed', 'A user document write needs confirmation before another operation');
const changed = () => failure('commit_guard_rejected', 'The operation is no longer current');
const missing = () => failure('storage_missing', 'The user document is missing');

/** No chat-owned cache or pending candidate: switching cards cannot discard a wallet write. */
export function createUserTransactions(options: {
    storage: JsonUserFilePort;
    partitions: XiaobaiOsPartitionRegistry;
    binder: TransactionCapabilityBinder;
    references: ChatReferencePort;
    resolveStory(write: boolean): Promise<CapturedChatBinding>;
    initialPartitions(): Promise<Record<string, unknown>>;
    createId?: () => string;
}): UserTransactions {
    let document: UserDocument | null = null;
    let pending: Pending | null = null;
    let state: XiaobaiOsFileState = 'ready';
    let queue: Promise<unknown> = Promise.resolve();
    const listeners = new Set<(change: XiaobaiOsFileStateChange) => void>();
    const stores = new Set<() => void>();
    const createId = options.createId ?? createStorageId;
    function enqueue<T>(work: () => Promise<T>): Promise<T> {
        const task = queue.then(work, work);
        queue = task.catch(() => undefined);
        return task;
    }
    function publish(next: XiaobaiOsFileState, error?: KernelWriteFailure) {
        state = next;
        for (const listener of listeners) {
            try { listener({ identityKey: USER_IDENTITY, state, ...(error ? { error } : {}) }); }
            catch (error) { console.error('[LittleWhiteBox] User file listener failed', error); }
        }
    }
    function install(next: UserDocument) {
        document = cloneJsonValue(next);
        for (const listener of stores) {
            try { listener(); } catch (error) { console.error('[LittleWhiteBox] User partition listener failed', error); }
        }
    }
    async function readServer() {
        const raw = await options.storage.read(USER_DOCUMENT_FILENAME);
        return raw === null ? null : parseUserDocument(raw);
    }
    function settle(entry: Pending, status: 'confirmed' | 'rejected' | 'abandoned') {
        const listener = entry.onSettled;
        entry.onSettled = undefined;
        try {listener?.(status);} catch (error) {console.error('[LittleWhiteBox] User file settlement listener failed', error);}
    }
    function accept(entry: Pending): PendingCommitRecoveryResult {
        pending = null;
        install(entry.candidate);
        settle(entry, 'confirmed');
        publish('ready');
        return { status: 'confirmed' };
    }
    function rejectBeforeUpload(entry: Pending, error: KernelWriteFailure, retrying: boolean): PendingCommitRecoveryResult {
        if (entry.retain || retrying && !entry.discardRejectedCandidate) { pending = entry; }
        else { pending = null; settle(entry, 'rejected'); }
        publish(pending ? 'failed' : 'ready', error);
        return { status: 'failed', error };
    }
    async function inspect(entry: Pending): Promise<PendingCommitRecoveryResult | null> {
        const observed = await readServer();
        if (sameUserDocument(observed, entry.candidate)) { return accept(entry); }
        if (!sameUserDocument(observed, entry.expected)) { pending = entry; publish('conflict'); return { status: 'conflict' }; }
        return null;
    }
    async function dispatch(entry: Pending, beforeDispatch?: () => boolean | Promise<boolean>): Promise<PendingCommitRecoveryResult> {
        const retrying = pending === entry;
        // The host has no server-side CAS. Check immediately before upload so a
        // completed write from another page cannot be replaced by our old snapshot.
        try {
            const inspected = await inspect(entry);
            if (inspected) { return inspected; }
        }
        catch (error) {
            const rejected = failure('storage_read_failed', error instanceof Error ? error.message : String(error));
            // A failed read cannot rule out an earlier upload whose result was unknown.
            if (retrying) {publish('unconfirmed', rejected); return { status: 'unconfirmed' };}
            return rejectBeforeUpload(entry, rejected, retrying);
        }
        try {
            if (entry.commitGuard && !await entry.commitGuard() || beforeDispatch && !await beforeDispatch()) {
                return rejectBeforeUpload(entry, changed(), retrying);
            }
        } catch (error) {
            return rejectBeforeUpload(entry, failure('commit_guard_rejected', error instanceof Error ? error.message : String(error)), retrying);
        }
        pending = entry;
        publish('saving');
        try {
            await options.storage.replace(USER_DOCUMENT_FILENAME, cloneJsonValue(entry.candidate));
            return accept(entry);
        } catch (error) {
            const status = (error as { httpStatus?: number }).httpStatus;
            if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
                const rejected = failure('storage_write_failed', error instanceof Error ? error.message : String(error));
                if (!entry.retain && (!retrying || entry.discardRejectedCandidate)) {
                    pending = null;
                    settle(entry, 'rejected');
                }
                publish(pending ? 'failed' : 'ready', rejected);
                return { status: 'failed', error: rejected };
            }
            // A transport exception is not proof that the server rejected the write.
            publish('unconfirmed', blocked());
            return await recover({ readOnly: true });
        }
    }
    async function recover(recovery: PendingCommitRecoveryOptions = {}): Promise<PendingCommitRecoveryResult> {
        const entry = pending;
        if (!entry) { return { status: 'none' }; }
        // Read-back can confirm an already committed operation even if its evidence
        // expired. Sending it again must still pass the original business guard.
        if (!recovery.readOnly) { return await dispatch(entry, recovery.beforeRetry); }
        try {
            const inspected = await inspect(entry);
            if (inspected) { return inspected; }
        }
        catch (error) {
            publish('unconfirmed', failure('storage_read_failed', error instanceof Error ? error.message : String(error)));
            return { status: 'unconfirmed' };
        }
        publish('unconfirmed');
        return { status: 'unconfirmed' };
    }
    async function prepare() {
        if (pending) {
            if (document) { return; }
            throw Object.assign(new Error(blocked().message), blocked());
        }
        publish('loading');
        try {
            const existing = await readServer();
            if (existing) { install(existing); publish('ready'); return; }
            // Deleting an already opened file must not silently grant another wallet.
            if (document) { throw Object.assign(new Error(missing().message), missing()); }
            const candidate = parseUserDocument({ formatVersion: 1, revision: 1, commitId: createId(),
                partitions: await options.initialPartitions(), stories: {} });
            const result = await dispatch({ expected: null, candidate, owner: '', retain: true });
            if (result.status !== 'confirmed') { throw Object.assign(new Error(blocked().message), blocked()); }
        } catch (error) {
            if (!pending) { publish('failed', failure('storage_read_failed', error instanceof Error ? error.message : String(error))); }
            throw error;
        }
    }
    function createStore<T>(registration: PartitionRegistration<T>, allowedCapabilities: readonly CapabilityToken<unknown>[] = []): PartitionStore<T> {
        options.partitions.assertRegistered(registration);
        if (!registration.storage) { throw new Error('A user store requires a user-owned partition'); }
        const storyOwned = registration.storage === 'user-story';
        const capture = () => storyOwned ? options.references.capture() : null;
        function rawSnapshot(current = capture()): PartitionSnapshot<unknown> {
            const scope = current?.reference?.osId ?? null;
            const raw = storyOwned ? scope ? document?.stories[scope]?.[registration.key] : undefined : document?.partitions[registration.key];
            return { identityKey: storyOwned ? current?.identityKey ?? '' : USER_IDENTITY, osId: scope,
                envelopeRevision: document?.revision ?? null, value: structuredClone(raw) };
        }
        function snapshot(current = capture()): PartitionSnapshot<T> {
            const raw = rawSnapshot(current);
            return { ...raw, value: raw.value === undefined ? null : parseRegisteredPartition(registration, raw.value) };
        }
        async function transact<R>(command: (context: ScopedTransaction<T>) => R | Promise<R>, transactionOptions: TransactionOptions = {}): Promise<ScopedTransactionResult<T, R>> {
            let requested = capture();
            const { signal, commitGuard: originalGuard } = transactionOptions;
            if (transactionOptions.abandonOnAbort && !signal) { throw new TypeError('candidate_lifetime_signal_required'); }
            const commitGuard = async () => !signal?.aborted && (!originalGuard || await originalGuard());
            const bindingGuard = async () => !storyOwned || !!requested && await options.references.isCurrent(requested);
            return await enqueue(async () => {
                if (pending) { return { status: 'failed', error: blocked() }; }
                const guard = async () => await commitGuard() && await bindingGuard();
                if (!await guard()) { return { status: 'failed', error: changed() }; }
                await prepare();
                const current = storyOwned ? await options.resolveStory(true) : null;
                if (storyOwned && current?.identityKey === requested?.identityKey && !requested?.reference) { requested = current; }
                if (!await guard()) { return { status: 'failed', error: changed() }; }
                const scope = current?.reference?.osId;
                if (storyOwned && !scope) { throw new Error('Story reference was not confirmed'); }
                const expected = document!;
                const { context, replacements } = preparePartitionCommand({ registration, partitions: options.partitions,
                    binder: options.binder, allowedCapabilities, scopeId: scope ?? USER_IDENTITY,
                    assertAccess: target => {
                        if (!target.storage || target.storage === 'user-story' && !scope) { throw new Error('Cross-document transaction is not allowed'); }
                    },
                    readRaw: target => target.storage === 'user' ? expected.partitions[target.key] : expected.stories[scope!]?.[target.key],
                });
                const result = await command(context);
                if (!replacements.size) { return { status: 'unchanged', result }; }
                if (!await guard()) { return { status: 'failed', error: changed() }; }
                const candidate = cloneJsonValue(expected);
                candidate.revision++;
                candidate.commitId = createId();
                for (const [key, value] of replacements) {
                    const target = options.partitions.require(key);
                    const values = target.storage === 'user' ? candidate.partitions : (candidate.stories[scope!] ??= {});
                    values[key] = value;
                }
                const entry: Pending = { expected, candidate, owner: registration.key, retain: !!transactionOptions.retainFailedCandidate,
                    commitGuard, onSettled: transactionOptions.onSettled,
                    discardRejectedCandidate: transactionOptions.discardRejectedCandidate };
                if (transactionOptions.abandonOnAbort && signal) {
                    const abandon = () => {
                        // Never unlock while an upload or recovery is still in flight, and
                        // never release a different operation that acquired this document.
                        void enqueue(async () => {
                            if (pending !== entry) { return; }
                            pending = null;
                            settle(entry, 'abandoned');
                            // Keep the last snapshot, not the unconfirmed candidate. prepare()
                            // re-reads the server before every subsequent command or read.
                            publish('ready');
                        });
                    };
                    entry.onSettled = status => {
                        signal.removeEventListener('abort', abandon);
                        transactionOptions.onSettled?.(status);
                    };
                    signal.addEventListener('abort', abandon, { once: true });
                    if (signal.aborted) { abandon(); }
                }
                const saved = await dispatch(entry, bindingGuard);
                if (saved.status === 'confirmed') { return { status: 'confirmed', result, snapshot: snapshot(current) }; }
                if (saved.status === 'failed') { return { status: 'failed', error: saved.error! }; }
                if (saved.status === 'conflict') { return { status: 'conflict', preparedResult: result }; }
                return { status: 'unconfirmed', preparedResult: result, commitId: candidate.commitId };
            });
        }
        return {
            peekBinding: () => storyOwned ? (() => { const current = capture(); return current ? { identityKey: current.identityKey, osId: current.reference?.osId ?? null } : null; })() : { identityKey: USER_IDENTITY, osId: null },
            peekCurrent: () => document && (!storyOwned || capture()) ? snapshot() : null,
            read: () => enqueue(async () => { await prepare(); const current = storyOwned ? await options.resolveStory(false) : null; return snapshot(current); }),
            readRaw: () => enqueue(async () => {
                const requested = capture();
                await prepare();
                const current = storyOwned ? await options.resolveStory(false) : null;
                if (storyOwned && (!requested || !await options.references.isCurrent(requested))) { throw Object.assign(new Error(changed().message), changed()); }
                return rawSnapshot(current);
            }),
            transact,
            subscribe(listener) { const publish = () => { if (!storyOwned || capture()) { listener(snapshot()); } }; stores.add(publish); return () => stores.delete(publish); },
        };
    }
    function peekOwnedStories<T>(registration: PartitionRegistration<T>): ReadonlyArray<{ scopeId: string; value: T }> {
        options.partitions.assertRegistered(registration);
        if (registration.storage !== 'user-story') {throw new Error('Expected an owner-scoped story partition');}
        return Object.entries(document?.stories ?? {}).flatMap(([scopeId, values]) => {
            const raw = values[registration.key];
            return raw === undefined ? [] : [{ scopeId, value: parseRegisteredPartition(registration, raw) }];
        });
    }
    async function transactOwned<T, R>(
        registration: PartitionRegistration<T>,
        capabilities: readonly CapabilityToken<unknown>[],
        command: (access: OwnedStoryAccess<T>) => R | Promise<R>,
    ): Promise<OwnedStoryResult<R>> {
        options.partitions.assertRegistered(registration);
        if (!registration.storage) {throw new Error('Owner transactions require a user partition');}
        return enqueue(async () => {
            if (pending) {return { status: 'failed', error: blocked() };}
            await prepare();
            const expected = document!;
            const candidate = cloneJsonValue(expected);
            let modified = false;
            const allowed = new Set(capabilities.map(token => token.id));
            const access: OwnedStoryAccess<T> = {
                global: () => cloneJsonValue(candidate.partitions[registration.key] ?? null),
                stories: () => Object.entries(candidate.stories)
                    .filter(([, values]) => Object.hasOwn(values, registration.key))
                    .map(([scopeId, values]) => ({ scopeId, raw: cloneJsonValue(values[registration.key]) })),
                replaceGlobal(value) {
                    candidate.partitions[registration.key] = serializeRegisteredPartition(registration, value);
                    modified = true;
                },
                replaceStory(scopeId, value) {
                    if (!Object.hasOwn(candidate.stories, scopeId)
                        || !Object.hasOwn(candidate.stories[scopeId]!, registration.key)) {
                        throw new Error('Owned story does not exist');
                    }
                    if (value === null) {delete candidate.stories[scopeId]![registration.key];}
                    else {candidate.stories[scopeId]![registration.key] = serializeRegisteredPartition(registration, value);}
                    modified = true;
                },
                useCapability(scopeId, token) {
                    if (!allowed.has(token.id)) {throw new Error('Capability not declared by owner');}
                    const access: CapabilityTransactionAccess = {
                        scopeId,
                        readPartition(target) {
                            options.partitions.assertRegistered(target);
                            if (target.ownerId !== 'economy' || target.storage !== 'user') {
                                throw new Error('Owner access cannot read another partition');
                            }
                            const raw = candidate.partitions[target.key];
                            return raw === undefined ? null : parseRegisteredPartition(target, raw);
                        },
                        replacePartition(target, value) {
                            options.partitions.assertRegistered(target);
                            if (target.ownerId !== 'economy' || target.storage !== 'user') {
                                throw new Error('Owner access cannot write another partition');
                            }
                            candidate.partitions[target.key] = serializeRegisteredPartition(target, value);
                            modified = true;
                        },
                    };
                    return options.binder.bind(token, registration.ownerId, access);
                },
            };
            const result = await command(access);
            if (!modified) {return { status: 'unchanged', result };}
            candidate.revision += 1;
            candidate.commitId = createId();
            const saved = await dispatch({ expected, candidate, owner: registration.key, retain: false });
            if (saved.status === 'confirmed') {return { status: 'confirmed', result };}
            if (saved.status === 'failed') {return { status: 'failed', error: saved.error! };}
            if (saved.status === 'conflict') {return { status: 'conflict' };}
            if (saved.status === 'unconfirmed') {return { status: 'unconfirmed' };}
            throw new Error('Unexpected owner transaction result');
        });
    }
    return {
        prepare: () => enqueue(prepare), createStore, transactOwned, peekOwnedStories,
        getFileState: () => state,
        hasPendingCommit: key => !!pending && (!key || pending.owner === key),
        subscribeFileState(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        retryPending: recovery => enqueue(() => recover(recovery)),
        adoptServerState: (guard?: () => boolean) => enqueue(async () => {
            if (guard && !guard()) { return { status: 'none' }; }
            // Read first: failure must not discard the only recoverable candidate.
            const observed = await readServer();
            if (!observed) { return { status: 'failed', error: missing() }; }
            if (pending && sameUserDocument(observed, pending.candidate)) { return accept(pending); }
            if (pending) {settle(pending, 'abandoned');}
            pending = null; install(observed); publish('ready'); return { status: 'adopted' };
        }),
    };
}
