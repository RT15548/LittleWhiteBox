import type {
    CapturedChatBinding,
    ChatReferencePort,
    KernelWriteFailure,
    ReferenceInstallResult,
    XiaobaiOsChatBindingV1,
    XiaobaiOsReferenceV1,
} from '../kernel/contracts.js';
import { parseXiaobaiOsReference, XiaobaiOsEnvelopeError } from '../kernel/envelope.js';

export type ChatMetadata = Record<string, unknown>;

export interface ChatMetadataCapture {
    identityKey: string;
    binding: XiaobaiOsChatBindingV1;
    metadata: ChatMetadata;
    mainChatId?: string;
}

export interface ChatMetadataAdapter {
    capture(): ChatMetadataCapture | null;
    save(capture: ChatMetadataCapture, signal?: AbortSignal): Promise<void>;
    read(binding: XiaobaiOsChatBindingV1, signal?: AbortSignal): Promise<ChatMetadata | null>;
}

export interface ChatReferenceOptions {
    recordOrphan?: (osId: string, binding: XiaobaiOsChatBindingV1) => void | Promise<void>;
    recordReference?: (osId: string, binding: XiaobaiOsChatBindingV1) => void | Promise<void>;
    createInstallEffect?: (capture: ChatMetadataCapture) => ChatReferenceInstallEffect | null;
}

export interface ChatReferenceInstallEffect {
    apply(): void;
    rollback(): void;
    matches(metadata: ChatMetadata): boolean;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameBinding(left: XiaobaiOsChatBindingV1, right: XiaobaiOsChatBindingV1): boolean {
    return left.kind === right.kind && left.ownerLocator === right.ownerLocator && left.chatId === right.chatId;
}

function failure(code: string, message: string, retryable: boolean): KernelWriteFailure {
    return { code, message, retryable };
}

export function readXiaobaiOsReference(metadata: unknown): XiaobaiOsReferenceV1 | null {
    if (!isRecord(metadata)) { return null; }
    const extensions = metadata.extensions;
    if (extensions === undefined) { return null; }
    if (!isRecord(extensions)) {
        throw new XiaobaiOsEnvelopeError('chat_metadata.extensions must be an object', 'chat_metadata.extensions');
    }
    const root = extensions.LittleWhiteBox;
    if (root === undefined) { return null; }
    if (!isRecord(root)) {
        throw new XiaobaiOsEnvelopeError(
            'chat_metadata.extensions.LittleWhiteBox must be an object',
            'chat_metadata.extensions.LittleWhiteBox',
        );
    }
    if (root.xiaobaiOsRef === undefined) { return null; }
    return parseXiaobaiOsReference(root.xiaobaiOsRef);
}

function requireLittleWhiteBox(metadata: ChatMetadata): UnknownRecord {
    if (metadata.extensions === undefined) { metadata.extensions = {}; }
    if (!isRecord(metadata.extensions)) {
        throw new XiaobaiOsEnvelopeError('chat_metadata.extensions must be an object', 'chat_metadata.extensions');
    }
    if (metadata.extensions.LittleWhiteBox === undefined) { metadata.extensions.LittleWhiteBox = {}; }
    if (!isRecord(metadata.extensions.LittleWhiteBox)) {
        throw new XiaobaiOsEnvelopeError(
            'chat_metadata.extensions.LittleWhiteBox must be an object',
            'chat_metadata.extensions.LittleWhiteBox',
        );
    }
    return metadata.extensions.LittleWhiteBox;
}

function restoreRoot(metadata: ChatMetadata, previousExtensions: unknown): void {
    if (previousExtensions === undefined) {
        delete metadata.extensions;
    } else {
        metadata.extensions = previousExtensions;
    }
}

function installReference(
    metadata: ChatMetadata,
    reference: XiaobaiOsReferenceV1,
): void {
    const root = requireLittleWhiteBox(metadata);
    root.xiaobaiOsRef = { ...reference };
}

function persistedInstallMatches(
    metadata: ChatMetadata | null,
    reference: XiaobaiOsReferenceV1,
    effect: ChatReferenceInstallEffect | null,
): boolean {
    if (!metadata) { return false; }
    let actual: XiaobaiOsReferenceV1 | null;
    try {
        actual = readXiaobaiOsReference(metadata);
    } catch {
        return false;
    }
    if (!actual || actual.osId !== reference.osId) { return false; }
    if (effect && !effect.matches(metadata)) { return false; }
    return true;
}

function isExplicitFailure(error: unknown): boolean {
    if (!isRecord(error)) { return false; }
    return error.uncertain === false
        || error.code === 'CHAT_CHANGED'
        || error.code === 'SAVE_UNAVAILABLE'
        || error.code === 'VALIDATION_FAILED';
}

export function createChatReferencePort(
    adapter: ChatMetadataAdapter,
    options: ChatReferenceOptions = {},
): ChatReferencePort {
    const pending = new Map<string, {
        captured: CapturedChatBinding;
        reference: XiaobaiOsReferenceV1;
        previousExtensions: unknown;
        effect: ChatReferenceInstallEffect | null;
    }>();

    function capture(): CapturedChatBinding | null {
        const current = adapter.capture();
        if (!current) { return null; }
        return {
            identityKey: current.identityKey,
            binding: { ...current.binding },
            reference: readXiaobaiOsReference(current.metadata),
        };
    }

    function isCurrent(captured: CapturedChatBinding): boolean {
        const current = adapter.capture();
        if (!current || current.identityKey !== captured.identityKey || !sameBinding(current.binding, captured.binding)) {
            return false;
        }
        let currentReference: XiaobaiOsReferenceV1 | null;
        try {
            currentReference = readXiaobaiOsReference(current.metadata);
        } catch {
            return false;
        }
        if (currentReference?.osId === captured.reference?.osId) { return true; }
        const pendingInstall = pending.get(captured.identityKey);
        return !!pendingInstall
            && pendingInstall.captured.reference?.osId === captured.reference?.osId
            && pendingInstall.reference.osId === currentReference?.osId;
    }

    async function install(
        captured: CapturedChatBinding,
        reference: XiaobaiOsReferenceV1,
        signal?: AbortSignal,
    ): Promise<ReferenceInstallResult> {
        const current = adapter.capture();
        if (
            !current
            || current.identityKey !== captured.identityKey
            || !sameBinding(current.binding, captured.binding)
        ) {
            return { status: 'failed', error: failure('chat_changed', 'The active chat changed before reference save', true) };
        }
        let existing: XiaobaiOsReferenceV1 | null;
        try {
            existing = readXiaobaiOsReference(current.metadata);
        } catch (error) {
            return {
                status: 'failed',
                error: failure(
                    'invalid_chat_metadata',
                    error instanceof Error ? error.message : 'Chat metadata is invalid',
                    false,
                ),
            };
        }
        const pendingInstall = pending.get(captured.identityKey);
        if (existing?.osId === reference.osId && captured.reference?.osId === reference.osId && !pendingInstall) {
            return { status: 'confirmed' };
        }
        if (existing && existing.osId !== reference.osId && existing.osId !== captured.reference?.osId) {
            return {
                status: 'failed',
                error: failure('reference_conflict', 'The chat reference changed before it could be replaced', false),
            };
        }

        if (pendingInstall && pendingInstall.reference.osId !== reference.osId) {
            return {
                status: 'failed',
                error: failure('reference_conflict', 'Another chat reference save is still pending', false),
            };
        }

        const previousExtensions = pendingInstall?.previousExtensions ?? (current.metadata.extensions === undefined
            ? undefined
            : structuredClone(current.metadata.extensions));
        let effect = pendingInstall?.effect ?? null;
        if (existing?.osId !== reference.osId) {
            try {
                effect ??= options.createInstallEffect?.(current) ?? null;
                installReference(current.metadata, reference);
                effect?.apply();
            } catch (error) {
                effect?.rollback();
                restoreRoot(current.metadata, previousExtensions);
                return {
                    status: 'failed',
                    error: failure(
                        'invalid_chat_metadata',
                        error instanceof Error ? error.message : 'Could not install the sidecar reference',
                        false,
                    ),
                };
            }
        }
        pending.set(captured.identityKey, {
            captured: {
                identityKey: captured.identityKey,
                binding: { ...captured.binding },
                reference: captured.reference ? { ...captured.reference } : null,
            },
            reference: { ...reference },
            previousExtensions,
            effect,
        });

        let saveError: unknown;
        try {
            if (pendingInstall) {
                const persisted = await adapter.read(current.binding, signal);
                if (persistedInstallMatches(persisted, reference, effect)) {
                    pending.delete(captured.identityKey);
                    return { status: 'confirmed' };
                }
            }
            await adapter.save(current, signal);
            pending.delete(captured.identityKey);
            return { status: 'confirmed' };
        } catch (error) {
            saveError = error;
        }
        if (saveError && isExplicitFailure(saveError)) {
            effect?.rollback();
            restoreRoot(current.metadata, previousExtensions);
            pending.delete(captured.identityKey);
            return {
                status: 'failed',
                error: failure(
                    'reference_save_failed',
                    saveError instanceof Error ? saveError.message : 'Chat reference save failed',
                    true,
                ),
            };
        }
        if (!pendingInstall) {
            try {
                const persisted = await adapter.read(current.binding, signal);
                if (persistedInstallMatches(persisted, reference, effect)) {
                    pending.delete(captured.identityKey);
                    return { status: 'confirmed' };
                }
            } catch {
                // Keep the candidate for explicit recovery; an unreadable result proves nothing.
            }
        }
        return {
            status: 'unconfirmed',
            error: failure('reference_save_unconfirmed', 'Could not confirm the saved chat reference', true),
        };
    }

    return Object.freeze({
        capture,
        isCurrent,
        install,
        recordOrphan: options.recordOrphan,
        recordReference: options.recordReference,
    });
}

export function readChatMetadataHeader(payload: unknown): ChatMetadata | null {
    if (Array.isArray(payload) && payload.length === 0) { return null; }
    if (isRecord(payload) && Object.keys(payload).length === 0) { return null; }
    if (!Array.isArray(payload) || !isRecord(payload[0])) {
        throw new Error('chat_header_invalid');
    }
    return isRecord(payload[0].chat_metadata) ? payload[0].chat_metadata as ChatMetadata : {};
}
