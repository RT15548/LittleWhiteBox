import type {
    MaintenanceRunner,
} from '../../../capabilities/maintenance/runner.js';
import type { XiaobaiOsHostFrameMessage } from '../../../host/frame-bridge.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';
import type {
    XiaobaiOsAppActivationContext,
    XiaobaiOsAppRuntime,
    XiaobaiOsChatIdentity,
} from '../../../types.js';
import type { MapService } from '../application/service.js';
import type { MapClientState, MapClientStatus } from '../types.js';
import { maintenanceState, skippedMaintenanceMessage } from './maintenance-state.js';

type UnknownRecord = Record<string, unknown>;

interface MapActivation {
    chatIdentity: string;
    post: XiaobaiOsAppActivationContext['post'];
}

interface MapControllerDependencies {
    map: MapService;
    settings: Pick<XiaobaiOsSettingsRepository, 'read' | 'setMapAutoMaintenance' | 'subscribe'>;
    maintenance: Pick<
        MaintenanceRunner,
        'startManual' | 'startRebuild' | 'cancelRequested' | 'invalidateAutomatic' | 'getStatus' | 'subscribeStatus'
    >;
    getChatIdentity: () => XiaobaiOsChatIdentity | { key?: unknown } | string | null;
    subscribeData: (listener: () => void) => () => void;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function identityKey(identity: ReturnType<MapControllerDependencies['getChatIdentity']>): string {
    return typeof identity === 'string' ? identity : String(identity?.key || '');
}

function clientStatus(writeState: ReturnType<MapService['getWriteState']>): {
    status: MapClientStatus;
    message: string;
} {
    if (writeState === 'loading') { return { status: 'loading', message: '正在加载地图…' }; }
    if (writeState === 'saving') { return { status: 'saving', message: '正在确认地图保存结果…' }; }
    if (writeState === 'unconfirmed') {
        return { status: 'unconfirmed', message: '还不确定地图是否保存成功，请先检查保存，再继续更新。' };
    }
    if (writeState === 'conflict') {
        return { status: 'conflict', message: '服务器上的存档与当前内容不同，请先选择要保留的版本。' };
    }
    if (writeState === 'failed') { return { status: 'error', message: '地图暂时加载不了，请重试。' }; }
    return { status: 'ready', message: '' };
}

export function createMapController({
    map,
    settings,
    maintenance,
    getChatIdentity,
    subscribeData,
}: MapControllerDependencies): XiaobaiOsAppRuntime & {
    activate: NonNullable<XiaobaiOsAppRuntime['activate']>;
    handleMessage: NonNullable<XiaobaiOsAppRuntime['handleMessage']>;
} {
    let activation: MapActivation | null = null;
    let unsubscribeData: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeStatus: (() => void) | null = null;

    function currentChatIdentity(): string {
        return identityKey(getChatIdentity());
    }

    function assertActivation(payload: UnknownRecord = {}): MapActivation {
        if (!activation) { throw new Error('地图 APP 未激活'); }
        const current = currentChatIdentity();
        if (!current || current !== activation.chatIdentity || String(payload.chatIdentity || '') !== current) {
            throw new Error('聊天已切换，请重新打开地图');
        }
        return activation;
    }

    function assertSameActivation(expected: MapActivation, payload: UnknownRecord = {}): void {
        if (assertActivation(payload) !== expected) { throw new Error('地图页面已切换，请重试'); }
    }

    function buildState(chatIdentity: string): MapClientState {
        const view = map.readCurrent();
        const status = clientStatus(view.writeState);
        const maintenanceStatus = maintenanceState(maintenance.getStatus('map', chatIdentity));
        return {
            chatIdentity,
            map: view.map,
            writeState: view.writeState,
            ...status,
            autoMaintenance: settings.read()?.apps.map.autoMaintenance === true,
            ...maintenanceStatus,
        };
    }

    function emitState(current = activation): MapClientState {
        if (!current) { throw new Error('地图 APP 未激活'); }
        const state = buildState(current.chatIdentity);
        current.post('map/state', { state });
        return state;
    }

    function emitCurrentState(): void {
        const current = activation;
        if (!current || currentChatIdentity() !== current.chatIdentity) { return; }
        try {
            emitState(current);
        } catch {
            current.post('map/error', { message: '地图状态暂时无法读取，请重新打开。' });
        }
    }

    function activate(context: XiaobaiOsAppActivationContext): MapClientState {
        deactivate();
        const chatIdentity = currentChatIdentity();
        if (!chatIdentity) { throw new Error('请先打开一个聊天'); }
        activation = { chatIdentity, post: context.post };
        return buildState(chatIdentity);
    }

    function deactivate(): void {
        activation = null;
    }

    function startMaintenance(
        mode: 'manual' | 'rebuild',
    ): { started: boolean; status: string; message: string; state: MapClientState } {
        const start = mode === 'rebuild'
            ? maintenance.startRebuild('map')
            : maintenance.startManual('map');
        return {
            started: start.status === 'started',
            status: start.status,
            message: start.status === 'skipped' ? skippedMaintenanceMessage(start.reason)
                : start.status === 'busy' ? '地图正在更新，请等待当前更新完成。' : '',
            state: emitState(),
        };
    }

    async function handleMessage(message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const payload = isRecord(message.payload) ? message.payload : {};
        const current = assertActivation(payload);
        if (message.type === 'map/refresh') {
            await map.refreshCurrent();
            assertSameActivation(current, payload);
            return emitState(current);
        }
        if (message.type === 'map/confirm-save') {
            const confirmation = await map.confirmPending();
            assertSameActivation(current, payload);
            return { confirmation: confirmation.status, state: emitState(current) };
        }
        if (message.type === 'map/adopt-server-state') {
            const adoption = await map.adoptServerState();
            assertSameActivation(current, payload);
            return { adoption: adoption.status, state: emitState(current) };
        }
        if (message.type === 'map/set-auto-maintenance') {
            if (typeof payload.enabled !== 'boolean') { throw new TypeError('地图自动维护开关无效'); }
            await settings.setMapAutoMaintenance(payload.enabled);
            assertSameActivation(current, payload);
            return emitState(current);
        }
        if (message.type === 'map/maintain-once') {
            return startMaintenance('manual');
        }
        if (message.type === 'map/rebuild') {
            return startMaintenance('rebuild');
        }
        throw new Error('未知的地图操作');
    }

    function handleDataChange(): void {
        emitCurrentState();
    }

    function handleMaintenanceStatus(participantId: string, chatIdentity: string): void {
        if (participantId === 'map' && activation?.chatIdentity === chatIdentity) { emitCurrentState(); }
    }

    return Object.freeze({
        activate,
        deactivate,
        cancelForeground: deactivate,
        cancelAll: deactivate,
        handleChatChanged() {
            deactivate();
            maintenance.cancelRequested('map', 'chat-changed');
            maintenance.invalidateAutomatic('map', 'chat-changed');
        },
        handleMessage,
        startBackground() {
            unsubscribeData ||= subscribeData(handleDataChange);
            unsubscribeSettings ||= settings.subscribe(emitCurrentState);
            unsubscribeStatus ||= maintenance.subscribeStatus(handleMaintenanceStatus);
        },
        stopBackground() {
            unsubscribeData?.();
            unsubscribeSettings?.();
            unsubscribeStatus?.();
            unsubscribeData = null;
            unsubscribeSettings = null;
            unsubscribeStatus = null;
            deactivate();
        },
    });
}
