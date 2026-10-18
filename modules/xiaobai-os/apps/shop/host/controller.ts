import type { EconomyReadCapability } from '../../../capabilities/economy/index.js';
import type { XiaobaiOsExecutionScope } from '../../../kernel/execution-scope.js';
import type {
    ShopActivateCommand,
    ShopDeactivateCommand,
    ShopPurchaseCommand,
    ShopService,
} from '../application/service.js';
import type {
    XiaobaiOsAppActivationContext,
    XiaobaiOsAppRuntime,
    XiaobaiOsChatIdentity,
} from '../../../types.js';
import type { XiaobaiOsHostFrameMessage } from '../../../host/frame-bridge.js';
import type { ShopClientState } from '../types.js';
import { presentShopState } from './presentation.js';
import { observeBackgroundTask } from '../../../../../shared/common/async-errors.js';


type UnknownRecord = Record<string, unknown>;

interface ShopActivation {
    chatIdentity: string;
    post: XiaobaiOsAppActivationContext['post'];
}

export interface ShopControllerDependencies {
    shop: ShopService;
    economy: EconomyReadCapability;
    getChatIdentity: () => XiaobaiOsChatIdentity | { key?: unknown } | string | null;
    isMainGenerationActive: () => boolean;
    subscribeGeneration: (listener: () => void) => () => void;
    execution?: XiaobaiOsExecutionScope;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function identityKey(identity: ReturnType<ShopControllerDependencies['getChatIdentity']>): string {
    return typeof identity === 'string' ? identity : String(identity?.key || '');
}

function requireString(value: unknown, name: string): string {
    const result = typeof value === 'string' ? value.trim() : '';
    if (!result || Array.from(result).length > 200) {throw new Error(`${name}无效`);}
    return result;
}

function requireCas(payload: UnknownRecord): { expectedRevision: number; expectedEventId: string } {
    const expectedRevision = payload.expectedRevision;
    const expectedEventId = payload.expectedEventId;
    if (typeof expectedRevision !== 'number' || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0
        || typeof expectedEventId !== 'string' || expectedEventId !== expectedEventId.trim()
        || Array.from(expectedEventId).length > 200 || /[\u0000-\u001f\u007f-\u009f]/u.test(expectedEventId)
        || (expectedRevision === 0) !== (expectedEventId === '')) {
        throw new Error('商店状态版本无效');
    }
    return { expectedRevision, expectedEventId };
}

export function createShopController({
    shop,
    economy,
    getChatIdentity,
    isMainGenerationActive,
    subscribeGeneration,
    execution,
}: ShopControllerDependencies): XiaobaiOsAppRuntime & {
    activate: NonNullable<XiaobaiOsAppRuntime['activate']>;
    handleMessage: NonNullable<XiaobaiOsAppRuntime['handleMessage']>;
} {
    let activation: ShopActivation | null = null;
    let preparation: { activation: ShopActivation; error: string } | null = null;
    let busy = false;
    let unsubscribeGeneration: (() => void) | null = null;
    let unsubscribeShop: (() => void) | null = null;

    const currentChatIdentity = (): string => identityKey(getChatIdentity());
    const isCurrent = (current: ShopActivation): boolean =>
        activation === current && currentChatIdentity() === current.chatIdentity;

    function assertActivation(payload: UnknownRecord = {}): ShopActivation {
        if (!activation) {throw new Error('商店 APP 未激活');}
        if (!isCurrent(activation) || String(payload.chatIdentity || '') !== activation.chatIdentity) {
            throw new Error('聊天已切换，请重新打开商店');
        }
        return activation;
    }

    function assertSameActivation(expected: ShopActivation, payload: UnknownRecord = {}): void {
        if (assertActivation(payload) !== expected) {throw new Error('商店页面已切换，请重试');}
    }

    function buildState(chatIdentity: string): ShopClientState {
        const next = presentShopState({
            chatIdentity,
            serviceView: shop.readCurrent(),
            generationActive: isMainGenerationActive(),
        });
        if (!preparation || preparation.activation !== activation) {return next;}
        if (preparation.error) {return { ...next, status: 'blocked', message: preparation.error };}
        if (next.status === 'unconfirmed' || next.status === 'conflict') {return next;}
        return { ...next, status: 'loading', message: '' };
    }

    function emitState(current = activation): ShopClientState {
        if (!current) {throw new Error('商店 APP 未激活');}
        const state = buildState(current.chatIdentity);
        current.post('shop/state', { state });
        return state;
    }

    function schedulePreparation(current: ShopActivation): void {
        const pending = { activation: current, error: '' };
        preparation = pending;
        const prepare = async () => {
            if (preparation !== pending || !isCurrent(current)) {return;}
            try {
                await economy.ensureOpen();
                if (preparation !== pending || !isCurrent(current)) {return;}
                preparation = null;
                emitState(current);
            } catch (error) {
                if (preparation !== pending || !isCurrent(current)) {return;}
                preparation = isRecord(error) && error.uncertain === true
                    ? null
                    : { activation: current, error: '商店数据暂时无法读取，请稍后重试。' };
                emitState(current);
            }
        };
        if (execution) {execution.setTimeout(prepare, 0);}
        else {globalThis.setTimeout(() => {observeBackgroundTask(prepare(), { source: import.meta.url, operation: "callback" });}, 0);}
    }

    function activate(context: XiaobaiOsAppActivationContext): ShopClientState {
        cancelForeground();
        const chatIdentity = currentChatIdentity();
        if (!chatIdentity) {throw new Error('请先打开一个聊天');}
        const current = { chatIdentity, post: context.post };
        activation = current;
        if (!economy.isOpen()) {schedulePreparation(current);}
        return buildState(chatIdentity);
    }

    function cancelForeground(): void {
        activation = null;
        preparation = null;
        busy = false;
    }

    async function runWrite<T>(
        current: ShopActivation,
        payload: UnknownRecord,
        command: () => Promise<T>,
    ): Promise<T> {
        if (busy) {throw new Error('已有商店操作正在处理');}
        busy = true;
        try {
            const result = await command();
            assertSameActivation(current, payload);
            emitState(current);
            return result;
        } catch (error) {
            if (isCurrent(current) && isRecord(error) && error.uncertain === true) {emitState(current);}
            throw error;
        } finally {
            if (activation === current) {busy = false;}
        }
    }

    async function handleMessage(message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const payload = isRecord(message.payload) ? message.payload : {};
        const current = assertActivation(payload);
        if (message.type === 'shop/refresh') {
            preparation = null;
            await shop.refreshCurrent();
            if (shop.getWriteState() === 'ready' && !economy.isOpen()) {await economy.ensureOpen();}
            assertSameActivation(current, payload);
            return emitState(current);
        }
        if (message.type === 'shop/confirm-save') {
            preparation = null;
            if (busy) {throw new Error('已有商店操作正在处理');}
            const confirmation = await shop.confirmPending();
            assertSameActivation(current, payload);
            return { confirmation: confirmation.status, state: emitState(current) };
        }
        if (message.type === 'shop/adopt-server-state') {
            preparation = null;
            if (busy) {throw new Error('已有商店操作正在处理');}
            const adoption = await shop.adoptServerState();
            assertSameActivation(current, payload);
            return { adoption: adoption.status, state: emitState(current) };
        }
        const base = {
            ...requireCas(payload),
            actionId: requireString(payload.actionId, '操作标识'),
        };
        if (message.type === 'shop/purchase') {
            const input: ShopPurchaseCommand = {
                ...base,
                itemId: requireString(payload.itemId, '商品'),
            };
            return runWrite(current, payload, async () => presentShopState({
                chatIdentity: current.chatIdentity,
                serviceView: await shop.purchaseCurrent(input),
                generationActive: isMainGenerationActive(),
            }));
        }
        if (message.type === 'shop/activate') {
            const input: ShopActivateCommand = {
                ...base,
                itemId: requireString(payload.itemId, '商品'),
                parameters: isRecord(payload.parameters) ? payload.parameters : {},
            };
            return runWrite(current, payload, async () => presentShopState({
                chatIdentity: current.chatIdentity,
                serviceView: await shop.activateCurrent(input),
                generationActive: isMainGenerationActive(),
            }));
        }
        if (message.type === 'shop/deactivate') {
            const input: ShopDeactivateCommand = {
                ...base,
                itemId: requireString(payload.itemId, '商品'),
                activationId: requireString(payload.activationId, '生效实例'),
            };
            return runWrite(current, payload, async () => presentShopState({
                chatIdentity: current.chatIdentity,
                serviceView: await shop.deactivateCurrent(input),
                generationActive: isMainGenerationActive(),
            }));
        }
        throw new Error('未知的商店操作');
    }

    function handleExternalState(): void {
        const current = activation;
        if (!current || !isCurrent(current)) {return;}
        try {emitState(current);}
        catch (error) {
            current.post('shop/error', { message: error instanceof Error ? error.message : String(error) });
        }
    }

    execution?.addCleanup(cancelForeground);

    return Object.freeze({
        activate,
        deactivate: cancelForeground,
        cancelForeground,
        cancelAll: cancelForeground,
        handleChatChanged: cancelForeground,
        handleMessage,
        startBackground() {
            unsubscribeGeneration ||= subscribeGeneration(handleExternalState);
            unsubscribeShop ||= shop.subscribe(handleExternalState);
        },
        stopBackground() {
            unsubscribeGeneration?.();
            unsubscribeGeneration = null;
            unsubscribeShop?.();
            unsubscribeShop = null;
            cancelForeground();
        },
    });
}
