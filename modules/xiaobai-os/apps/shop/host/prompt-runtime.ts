import { parseShopEffectReceipt } from '../../../domains/shop/invariants.js';
import { createStorageId } from '../../../kernel/identity.js';
import { buildShopPromptBlock } from '../../../domains/shop/prompt.js';
import { createShopEffectReceipt, projectShopState } from '../../../domains/shop/timeline.js';
import {
    SHOP_EFFECT_RECEIPT_VERSION,
    type ShopDomainV2,
    type ShopEffectReceipt,
    type ShopGenerationMode,
} from '../../../domains/shop/types.js';
import type { XiaobaiOsAppRuntime } from '../../../types.js';
import type { ShopConversationSnapshot, ShopMessageReceiptBinding } from './message-receipts.js';

export interface ShopGenerationEvent {
    type: string;
    dryRun?: boolean;
}

export interface ShopPromptEventHandlers {
    generationStarted: (event: ShopGenerationEvent) => void;
    intercept: (event: ShopGenerationEvent) => Promise<void> | void;
    requestBuilt: () => void;
    generationEnded: () => void;
    generationStopped: () => void;
    messageReceived: (messageId: unknown, type: unknown) => void;
}

interface ShopPromptRuntimeDependencies {
    captureConversation: () => ShopConversationSnapshot | null;
    readShop: (chatIdentity: string) => ShopDomainV2 | null;
    enqueueDelivery: (input: {
        chatIdentity: string;
        actionId: string;
        receipt: ShopEffectReceipt;
    }) => void;
    bindReplyReceipt: (input: {
        chatIdentity: string;
        messageId: number;
        receipt: ShopEffectReceipt;
    }) => ShopMessageReceiptBinding;
    setPrompt: (value: string) => void;
    subscribe: (handlers: ShopPromptEventHandlers) => () => void;
    createActionId?: () => string;
    onError?: (error: unknown) => void;
}

export type ShopPromptRuntime = Pick<
    XiaobaiOsAppRuntime,
    'startBackground' | 'stopBackground' | 'handleChatChanged' | 'cancelAll'
>;

function defaultActionId(): string {
    return `shop-delivery:${createStorageId()}`;
}

function generationMode(type: string): ShopGenerationMode | null {
    if (!type || type === 'normal') {return 'normal';}
    if (type === 'regenerate' || type === 'swipe' || type === 'continue') {return type;}
    return null;
}

function emptyReceipt(): ShopEffectReceipt {
    return {
        schemaVersion: SHOP_EFFECT_RECEIPT_VERSION,
        activeActivationIds: [],
        transitionActivationIds: [],
    };
}

function hasEffects(receipt: ShopEffectReceipt): boolean {
    return receipt.activeActivationIds.length > 0 || receipt.transitionActivationIds.length > 0;
}

function receiptForRevision(snapshot: ShopConversationSnapshot): ShopEffectReceipt {
    for (let index = snapshot.messages.length - 1; index >= 0; index -= 1) {
        const message = snapshot.messages[index];
        if (message?.role !== 'assistant') {continue;}
        return message.shopEffectReceipt === undefined
            ? emptyReceipt()
            : parseShopEffectReceipt(message.shopEffectReceipt);
    }
    return emptyReceipt();
}

export function createShopPromptRuntime({
    captureConversation,
    readShop,
    enqueueDelivery,
    bindReplyReceipt,
    setPrompt,
    subscribe,
    createActionId = defaultActionId,
    onError = (error) => console.error('[LittleWhiteBox] 商店效果运行失败', error),
}: ShopPromptRuntimeDependencies): ShopPromptRuntime {
    let unsubscribe: (() => void) | null = null;
    let generation = 0;
    let started: null | {
        mode: ShopGenerationMode;
        dryRun: boolean;
        chatIdentity: string | null;
        regenerateReceipt: ShopEffectReceipt | null;
    } = null;
    let pending: null | {
        generation: number;
        kind: 'delivery';
        chatIdentity: string;
        actionId: string;
        receipt: ShopEffectReceipt;
    } | {
        generation: number;
        kind: 'reuse';
        chatIdentity: string;
        receipt: ShopEffectReceipt;
    } = null;

    function clearPrompt(): void {
        setPrompt('');
    }

    function invalidate(): void {
        generation += 1;
        started = null;
        pending = null;
        clearPrompt();
    }

    function generationStarted(event: ShopGenerationEvent): void {
        invalidate();
        const mode = generationMode(event.type);
        if (!mode) {return;}
        started = {
            mode,
            dryRun: event.dryRun === true,
            chatIdentity: null,
            regenerateReceipt: null,
        };
        if (mode !== 'regenerate') {return;}
        try {
            const snapshot = captureConversation();
            if (!snapshot) {return;}
            started = {
                mode,
                dryRun: event.dryRun === true,
                chatIdentity: snapshot.identityKey,
                regenerateReceipt: receiptForRevision(snapshot),
            };
        } catch (error) {
            onError(error);
        }
    }

    function intercept(event: ShopGenerationEvent): void {
        const mode = generationMode(event.type);
        const requestGeneration = ++generation;
        const matchingStart = started?.mode === mode ? started : null;
        started = null;
        pending = null;
        clearPrompt();
        if (!mode) {return;}
        try {
            const snapshot = captureConversation();
            const domain = snapshot ? readShop(snapshot.identityKey) : null;
            if (!snapshot || !domain) {return;}
            if (matchingStart?.chatIdentity && matchingStart.chatIdentity !== snapshot.identityKey) {return;}
            if (mode === 'regenerate' && matchingStart && !matchingStart.regenerateReceipt) {return;}
            const receipt = mode === 'normal'
                ? createShopEffectReceipt(domain)
                : mode === 'regenerate' && matchingStart?.regenerateReceipt
                    ? matchingStart.regenerateReceipt
                    : receiptForRevision(snapshot);
            if (requestGeneration !== generation || !hasEffects(receipt)) {return;}
            setPrompt(buildShopPromptBlock(projectShopState(domain), receipt));
            if (matchingStart?.dryRun === true) {return;}
            if (mode === 'normal') {
                pending = {
                    generation: requestGeneration,
                    kind: 'delivery',
                    chatIdentity: snapshot.identityKey,
                    actionId: createActionId(),
                    receipt,
                };
            } else if (mode === 'regenerate') {
                pending = {
                    generation: requestGeneration,
                    kind: 'reuse',
                    chatIdentity: snapshot.identityKey,
                    receipt,
                };
            }
        } catch (error) {
            if (requestGeneration === generation) {
                pending = null;
                clearPrompt();
            }
            onError(error);
        }
    }

    function messageReceived(messageId: unknown, type: unknown): void {
        const current = pending;
        const receivedMode = generationMode(String(type || ''));
        const modeMatches = current?.kind === 'delivery'
            ? receivedMode === 'normal'
            : receivedMode === 'regenerate' || receivedMode === 'normal';
        if (!current || current.generation !== generation || !modeMatches) {return;}
        pending = null;
        if (!Number.isSafeInteger(messageId) || Number(messageId) < 0) {
            onError(new Error('shop_generation_message_invalid'));
            return;
        }
        try {
            const snapshot = captureConversation();
            const message = snapshot?.messages[Number(messageId)];
            if (
                !snapshot
                || snapshot.identityKey !== current.chatIdentity
                || Number(messageId) !== snapshot.messages.length - 1
                || message?.role !== 'assistant'
                || !message.content.trim()
            ) {return;}
            const binding = bindReplyReceipt({
                chatIdentity: current.chatIdentity,
                messageId: Number(messageId),
                receipt: current.receipt,
            });
            if (current.kind === 'delivery') {
                try {
                    enqueueDelivery({
                        chatIdentity: current.chatIdentity,
                        actionId: current.actionId,
                        receipt: current.receipt,
                    });
                } catch (error) {
                    binding.rollback();
                    throw error;
                }
            }
        } catch (error) {
            onError(error);
        }
    }

    function startBackground(): void {
        if (!unsubscribe) {
            unsubscribe = subscribe({
                generationStarted,
                intercept,
                requestBuilt: clearPrompt,
                generationEnded: clearPrompt,
                generationStopped: invalidate,
                messageReceived,
            });
        }
    }

    function stopBackground(): void {
        unsubscribe?.();
        unsubscribe = null;
        invalidate();
    }

    return Object.freeze({
        startBackground,
        stopBackground,
        handleChatChanged: invalidate,
        cancelAll: invalidate,
    });
}
