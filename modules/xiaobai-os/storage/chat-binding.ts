import type {
    CapturedChatBinding,
    ChatReferencePort,
    ChatPersistence,
    KernelWriteFailure,
    SidecarRevision,
    XiaobaiOsChatBindingV1,
    XiaobaiOsSidecarV1,
    XiaobaiOsStoragePort,
} from '../kernel/contracts.js';
import { cloneJsonValue, sidecarRevision } from '../kernel/envelope.js';
import { createStorageId } from '../kernel/identity.js';
import {
    readXiaobaiOsReference,
    type ChatMetadataAdapter,
    type ChatMetadataCapture,
} from './chat-reference.js';
import type { SidecarIndex } from './sidecar-index.js';

export type ChatBindingResolution =
    | { status: 'empty' }
    | { status: 'ready'; envelope: XiaobaiOsSidecarV1; created: boolean }
    | { status: 'unconfirmed'; osId: string }
    | { status: 'conflict'; error: KernelWriteFailure }
    | { status: 'failed'; error: KernelWriteFailure };

export interface ChatBindingManagerOptions {
    metadata: ChatMetadataAdapter;
    references: ChatReferencePort;
    storage: XiaobaiOsStoragePort;
    index: SidecarIndex;
    createId?: () => string;
    prepareClonedPartitions?: (capture: ChatMetadataCapture, source: XiaobaiOsChatBindingV1, partitions: Record<string, unknown>, ids: { source: string; target: string }) => void | Promise<void>;
    cleanupAttachments?: (osId: string) => Promise<void>;
    prepareInitialPartitions?: (capture: CapturedChatBinding) => Promise<Record<string, unknown>>;
}

export interface ChatBindingManager {
    ensureCurrent(options?: { chatPersistence?: ChatPersistence }): Promise<ChatBindingResolution>;
    resolveCurrent(options?: { chatPersistence?: ChatPersistence }): Promise<ChatBindingResolution>;
    retryPendingCurrent(options?: { chatPersistence?: ChatPersistence }): Promise<ChatBindingResolution>;
    handleChatDeleted(chatId: string, ownerLocator?: string): Promise<'deleted' | 'retained'>;
    handleCharacterRenamed(oldOwnerLocator: string, newOwnerLocator: string): Promise<void>;
}

interface PendingNewSidecar {
    capture: ChatMetadataCapture;
    referenceCapture: CapturedChatBinding;
    candidate: XiaobaiOsSidecarV1;
    stage: 'replace' | 'reference';
}

function failure(code: string, message: string, retryable: boolean): KernelWriteFailure {
    return { code, message, retryable };
}

function captureForReference(capture: ChatMetadataCapture): CapturedChatBinding {
    return {
        identityKey: capture.identityKey,
        binding: { ...capture.binding },
        reference: readXiaobaiOsReference(capture.metadata),
    };
}

function sameBinding(left: XiaobaiOsChatBindingV1, right: XiaobaiOsChatBindingV1): boolean {
    return left.kind === right.kind && left.ownerLocator === right.ownerLocator && left.chatId === right.chatId;
}

function expectedRevision(envelope: XiaobaiOsSidecarV1): SidecarRevision {
    return sidecarRevision(envelope);
}

export function createChatBindingManager(options: ChatBindingManagerOptions): ChatBindingManager {
    const { metadata, references, storage, index } = options;
    const createId = options.createId ?? createStorageId;
    const pending = new Map<string, PendingNewSidecar>();

    function rememberBestEffort(osId: string, binding: XiaobaiOsChatBindingV1): void {
        void index.remember(osId, binding).catch(error => {
            console.warn('[LittleWhiteBox] 小白 OS sidecar 索引登记失败', error);
        });
    }

    async function finishReference(
        entry: PendingNewSidecar,
        chatPersistence: ChatPersistence,
    ): Promise<ChatBindingResolution> {
        const installed = await references.install(entry.referenceCapture, {
            formatVersion: 1,
            osId: entry.candidate.osId,
        }, { chatPersistence });
        if (installed.status === 'confirmed' || installed.status === 'deferred') {
            pending.delete(entry.capture.identityKey);
            rememberBestEffort(entry.candidate.osId, entry.capture.binding);
            return { status: 'ready', envelope: entry.candidate, created: true };
        }
        pending.delete(entry.capture.identityKey);
        if (installed.applied) {
            // The file is usable. Only the reference port retains the outstanding
            // chat save; keeping this file candidate could restore an old revision.
            rememberBestEffort(entry.candidate.osId, entry.capture.binding);
            return installed.status === 'unconfirmed'
                ? { status: 'unconfirmed', osId: entry.candidate.osId }
                : { status: 'failed', error: installed.error };
        }
        try {
            await storage.delete(entry.candidate.osId);
            await options.cleanupAttachments?.(entry.candidate.osId);
        } catch {
            rememberBestEffort(entry.candidate.osId, entry.capture.binding);
        }
        return { status: 'failed', error: installed.error };
    }

    async function continuePending(
        entry: PendingNewSidecar,
        retry: boolean,
        chatPersistence: ChatPersistence,
    ): Promise<ChatBindingResolution> {
        if (entry.stage === 'replace') {
            let observed: XiaobaiOsSidecarV1 | null;
            try {
                observed = await storage.read(entry.candidate.osId);
            } catch {
                return { status: 'unconfirmed', osId: entry.candidate.osId };
            }
            if (observed?.commitId === entry.candidate.commitId) {
                entry.stage = 'reference';
            } else if (observed) {
                return { status: 'conflict', error: failure('storage_conflict', 'New sidecar path contains other data', false) };
            } else if (!retry) {
                return { status: 'unconfirmed', osId: entry.candidate.osId };
            } else {
                const written = await storage.replace({ expected: null, candidate: entry.candidate });
                if (written.status === 'failed') { return { status: 'failed', error: written.error }; }
                if (written.status !== 'confirmed') {
                    return written.status === 'conflict'
                        ? { status: 'conflict', error: failure('storage_conflict', 'New sidecar path contains other data', false) }
                        : { status: 'unconfirmed', osId: entry.candidate.osId };
                }
                entry.stage = 'reference';
            }
        }
        return await finishReference(entry, chatPersistence);
    }

    async function completeNewSidecar(
        capture: ChatMetadataCapture,
        candidate: XiaobaiOsSidecarV1,
        chatPersistence: ChatPersistence,
    ): Promise<ChatBindingResolution> {
        const entry: PendingNewSidecar = {
            capture,
            referenceCapture: captureForReference(capture),
            candidate,
            stage: 'replace',
        };
        const written = await storage.replace({ expected: null, candidate });
        if (written.status === 'failed') {
            await options.cleanupAttachments?.(candidate.osId);
            return { status: 'failed', error: written.error };
        }
        if (written.status === 'unconfirmed' || written.status === 'conflict') {
            if (written.status === 'unconfirmed') { pending.set(capture.identityKey, entry); }
            return written.status === 'conflict'
                ? { status: 'conflict', error: failure('storage_conflict', 'New sidecar path already contains other data', false) }
                : { status: 'unconfirmed', osId: candidate.osId };
        }
        entry.stage = 'reference';
        return await finishReference(entry, chatPersistence);
    }

    async function cloneForCurrent(
        capture: ChatMetadataCapture,
        source: XiaobaiOsSidecarV1,
        chatPersistence: ChatPersistence,
    ): Promise<ChatBindingResolution> {
        const partitions = cloneJsonValue(source.partitions);
        const osId = createId();
        await options.prepareClonedPartitions?.(capture, source.binding, partitions, { source: source.osId, target: osId });
        const candidate: XiaobaiOsSidecarV1 = {
            formatVersion: 1,
            osId,
            binding: { ...capture.binding },
            revision: 0,
            commitId: createId(),
            partitions,
        };
        return await completeNewSidecar(capture, candidate, chatPersistence);
    }

    async function updateBinding(
        capture: ChatMetadataCapture,
        source: XiaobaiOsSidecarV1,
    ): Promise<ChatBindingResolution> {
        const candidate: XiaobaiOsSidecarV1 = {
            ...cloneJsonValue(source),
            binding: { ...capture.binding },
            revision: source.revision + 1,
            commitId: createId(),
        };
        const result = await storage.replace({ expected: expectedRevision(source), candidate });
        if (result.status === 'confirmed') {
            rememberBestEffort(candidate.osId, candidate.binding);
            return { status: 'ready', envelope: candidate, created: false };
        }
        if (result.status === 'unconfirmed') { return { status: 'unconfirmed', osId: candidate.osId }; }
        if (result.status === 'conflict') {
            return { status: 'conflict', error: failure('identity_conflict', 'Sidecar binding update conflicted', false) };
        }
        return { status: 'failed', error: result.error };
    }

    async function resolveReferenced(
        capture: ChatMetadataCapture,
        osId: string,
        chatPersistence: ChatPersistence,
    ): Promise<ChatBindingResolution> {
        let sidecar: XiaobaiOsSidecarV1 | null;
        try {
            sidecar = await storage.read(osId);
        } catch (error) {
            return {
                status: 'failed',
                error: failure(
                    'storage_read_failed',
                    error instanceof Error ? error.message : 'Could not read sidecar',
                    true,
                ),
            };
        }
        if (!sidecar) {
            return { status: 'failed', error: failure('storage_missing', 'Referenced sidecar is missing', true) };
        }
        if (sameBinding(sidecar.binding, capture.binding)) {
            rememberBestEffort(osId, capture.binding);
            return { status: 'ready', envelope: sidecar, created: false };
        }

        // A still-existing former owner proves this is a copied/imported chat. Absence proves a missed rename.
        try {
            const formerChat = await metadata.read(sidecar.binding);
            if (formerChat !== null) { return await cloneForCurrent(capture, sidecar, chatPersistence); }
            return await updateBinding(capture, sidecar);
        } catch {
            return {
                status: 'conflict',
                error: failure(
                    'identity_conflict',
                    'Could not determine whether the sidecar reference was copied or renamed',
                    true,
                ),
            };
        }
    }

    async function resolveBranch(capture: ChatMetadataCapture, chatPersistence: ChatPersistence): Promise<ChatBindingResolution> {
        const mainChatId = String(capture.mainChatId || '').trim();
        if (!mainChatId) { return { status: 'empty' }; }
        const parentBinding = { ...capture.binding, chatId: mainChatId };
        let parentMetadata;
        try {
            parentMetadata = await metadata.read(parentBinding);
        } catch (error) {
            return {
                status: 'failed',
                error: failure(
                    'branch_parent_unavailable',
                    error instanceof Error ? error.message : 'Could not read branch parent',
                    true,
                ),
            };
        }
        if (!parentMetadata) { return { status: 'empty' }; }
        let parentReference;
        try {
            parentReference = readXiaobaiOsReference(parentMetadata);
        } catch (error) {
            return {
                status: 'failed',
                error: failure(
                    'branch_parent_invalid',
                    error instanceof Error ? error.message : 'Branch parent reference is invalid',
                    false,
                ),
            };
        }
        if (!parentReference) { return { status: 'empty' }; }
        try {
            const parentSidecar = await storage.read(parentReference.osId);
            if (!parentSidecar) {
                return { status: 'failed', error: failure('branch_parent_missing', 'Branch parent sidecar is missing', true) };
            }
            return await cloneForCurrent(capture, parentSidecar, chatPersistence);
        } catch (error) {
            return {
                status: 'failed',
                error: failure(
                    'branch_parent_unavailable',
                    error instanceof Error ? error.message : 'Could not copy branch parent sidecar',
                    true,
                ),
            };
        }
    }

    async function resolveCurrent({ chatPersistence = 'host' }: { chatPersistence?: ChatPersistence } = {}): Promise<ChatBindingResolution> {
        const capture = metadata.capture();
        if (!capture) {
            return { status: 'failed', error: failure('chat_unavailable', 'No chat is currently open', false) };
        }
        const pendingEntry = pending.get(capture.identityKey);
        if (pendingEntry) {
            if (!sameBinding(pendingEntry.capture.binding, capture.binding)) {
                return { status: 'conflict', error: failure('identity_conflict', 'Pending sidecar belongs to another chat', false) };
            }
            return await continuePending(pendingEntry, false, chatPersistence);
        }
        let reference;
        try {
            const restored = await references.restorePending(captureForReference(capture), chatPersistence);
            if (restored?.status === 'failed') { return { status: 'failed', error: restored.error }; }
            if (restored?.status === 'unconfirmed') {
                return { status: 'unconfirmed', osId: readXiaobaiOsReference(capture.metadata)!.osId };
            }
            reference = readXiaobaiOsReference(capture.metadata);
        } catch (error) {
            return {
                status: 'failed',
                error: failure(
                    'invalid_chat_metadata',
                    error instanceof Error ? error.message : 'Chat reference is invalid',
                    false,
                ),
            };
        }
        return reference ? await resolveReferenced(capture, reference.osId, chatPersistence) : await resolveBranch(capture, chatPersistence);
    }

    async function retryPendingCurrent({ chatPersistence = 'immediate' }: { chatPersistence?: ChatPersistence } = {}): Promise<ChatBindingResolution> {
        const capture = metadata.capture();
        if (!capture) {
            return { status: 'failed', error: failure('chat_unavailable', 'No chat is currently open', false) };
        }
        const entry = pending.get(capture.identityKey);
        return entry ? await continuePending(entry, true, chatPersistence) : await resolveCurrent({ chatPersistence });
    }

    async function handleChatDeleted(chatId: string, ownerLocator?: string): Promise<'deleted' | 'retained'> {
        const matches = await index.findByChatId(chatId, ownerLocator);
        if (matches.length !== 1) { return 'retained'; }
        const [osId] = matches;
        try {
            await storage.delete(osId);
            await options.cleanupAttachments?.(osId);
            await index.forget(osId);
            return 'deleted';
        } catch (error) {
            console.error('[LittleWhiteBox] Chat data cleanup failed', error);
            return 'retained';
        }
    }

    async function handleCharacterRenamed(oldOwnerLocator: string, newOwnerLocator: string): Promise<void> {
        await index.updateOwner(oldOwnerLocator, newOwnerLocator);
    }

    async function ensureCurrent({ chatPersistence = 'immediate' }: { chatPersistence?: ChatPersistence } = {}): Promise<ChatBindingResolution> {
        const capture = metadata.capture();
        const resolved = await resolveCurrent({ chatPersistence });
        if (resolved.status !== 'empty' || !capture) { return resolved; }
        const referenceCapture = captureForReference(capture);
        const partitions = await options.prepareInitialPartitions?.(referenceCapture) ?? {};
        if (!await references.isCurrent(referenceCapture)) {
            return { status: 'failed', error: failure('chat_changed', 'Chat changed while preparing its reference', true) };
        }
        return await completeNewSidecar(capture, { formatVersion: 1, osId: createId(), binding: { ...capture.binding },
            revision: 0, commitId: createId(), partitions }, chatPersistence);
    }
    return Object.freeze({ resolveCurrent, ensureCurrent, retryPendingCurrent, handleChatDeleted, handleCharacterRenamed });
}
