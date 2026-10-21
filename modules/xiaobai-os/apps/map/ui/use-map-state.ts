import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { MapClientState } from '../types.js';
import { MAP_PROJECTION_COPY } from './map-copy.js';

type Action = 'refresh' | 'settings' | 'projection' | 'maintain' | 'rebuild' | 'adopt';
function record(value: unknown): value is Record<string, unknown> {return !!value && typeof value === 'object' && !Array.isArray(value);}
function maintaining(state: MapClientState): boolean {return state.maintenanceStatus === 'maintaining' || state.maintenanceStatus === 'rebuilding';}

/** The Map UI's host connection. Browsing state is intentionally not owned here. */
export function useMapState(props: XiaobaiOsAppProps) {
    const state = ref(structuredClone(toRaw(props.initialState as MapClientState)));
    const activeRequest = ref<Action | null>(null);
    const localMessage = ref('');
    const localError = ref(false);
    let mounted = false;
    let requestSequence = 0;
    let pushedVersion = 0;
    let unsubscribe = () => {};
    const requiresConfirmation = computed(() => state.value.status === 'unconfirmed' || state.value.writeState === 'unconfirmed');
    const busy = computed(() => activeRequest.value !== null || ['loading', 'saving'].includes(state.value.status) || ['maintaining', 'rebuilding'].includes(state.value.maintenanceStatus || ''));
    const disabledReason = computed(() => {
        if (busy.value) {return '正在更新地图，请稍候';}
        if (requiresConfirmation.value) {return '正在保存，请稍候';}
        if (state.value.status === 'conflict') {return '存档有变化，请先选择要保留的版本';}
        if (state.value.status !== 'ready') {return state.value.message || '地图暂时不可更新';}
        if (!state.value.chatIdentity) {return '请先打开一个聊天';}
        return '';
    });
    const status = computed(() => {
        if (state.value.maintenanceStatus === 'rebuilding' || activeRequest.value === 'rebuild') {return '正在绘制世界…';}
        if (state.value.maintenanceStatus === 'maintaining' || activeRequest.value === 'maintain') {return '正在更新地图…';}
        if (busy.value) {return '请稍候…';}
        return '';
    });
    // Pending acknowledgement belongs to background recovery, not an error banner.
    const notice = computed(() => localError.value ? localMessage.value : requiresConfirmation.value ? '' : state.value.message || localMessage.value);
    const isError = computed(() => localError.value || (!requiresConfirmation.value && ['blocked', 'error', 'conflict'].includes(state.value.status)));
    function apply(next: MapClientState): void {
        const wasMaintaining = maintaining(state.value);
        state.value = structuredClone(next);
        if (maintaining(next)) {
            localMessage.value = '';
            localError.value = false;
        } else if (wasMaintaining) {
            localMessage.value = next.maintenanceMessage || '';
            localError.value = next.maintenanceStatus === 'error';
        }
    }
    function readableError(error: unknown, action: Action): string {
        const text = error instanceof Error ? error.message : String(error);
        if (text.includes('聊天已切换')) {return '聊天已切换，请重新打开地图。';}
        if (action === 'adopt') {return '已保存版本暂时加载不了，当前修改还在，请稍后重试。';}
        if (action === 'settings' || action === 'projection') {return '设置未能保存，请重试。';}
        return '地图操作未完成，请稍后重试。';
    }
    async function request(endpoint: string, action: Action, extra: Record<string, unknown> = {}): Promise<void> {
        if (activeRequest.value) {return;}
        const sequence = ++requestSequence;
        const version = pushedVersion;
        const identity = state.value.chatIdentity;
        activeRequest.value = action;
        localMessage.value = '';
        localError.value = false;
        try {
            const response = await props.bridge.request(endpoint, { chatIdentity: identity, ...extra }, 35_000);
            if (!mounted || sequence !== requestSequence || state.value.chatIdentity !== identity) {return;}
            const result = record(response) ? response.result : undefined;
            const next = record(result) && record(result.state) ? result.state : result;
            if (version === pushedVersion && record(next) && next.chatIdentity === identity) {apply(next as unknown as MapClientState);}
            if ((action === 'maintain' || action === 'rebuild') && record(result) && typeof result.message === 'string' && result.message) {
                localMessage.value = result.message;
            }
            if (action === 'refresh' && state.value.status === 'ready') {localMessage.value = '已加载保存的地图。';}
            if (action === 'settings') {localMessage.value = state.value.autoMaintenance ? '自动更新已开启。' : '自动更新已关闭。';}
            if (action === 'projection') {localMessage.value = state.value.projectToChat ? MAP_PROJECTION_COPY.enabled : MAP_PROJECTION_COPY.disabled;}
            if (action === 'adopt' && record(result) && result.adoption === 'adopted') {localMessage.value = '已使用当前聊天里保存的 OS 存档。';}
        } catch (error) {
            if (mounted && sequence === requestSequence && state.value.chatIdentity === identity) {
                if (error instanceof Error && error.message === 'host_request_timeout') { return; }
                localMessage.value = readableError(error, action);
                localError.value = true;
            }
        } finally {if (mounted && sequence === requestSequence) {activeRequest.value = null;}}
    }
    onMounted(() => {
        mounted = true;
        unsubscribe = props.bridge.subscribe(message => {
            if (message.type === 'map/state') {
                const next = (message.payload as { state: MapClientState }).state;
                if (next.chatIdentity !== state.value.chatIdentity) {return;}
                pushedVersion += 1;
                apply(next);
            } else if (message.type === 'map/error') {
                pushedVersion += 1;
                localError.value = true;
                localMessage.value = (message.payload as { message?: string }).message || '地图暂时无法读取，请重新打开。';
            }
        });
    });
    onBeforeUnmount(() => {mounted = false; requestSequence += 1; unsubscribe();});
    return {
        state, activeRequest, busy, disabledReason, requiresConfirmation, status, notice, isError,
        dismissNotice: () => {localMessage.value = ''; localError.value = false;},
        refresh: () => {if (!busy.value && !requiresConfirmation.value) {return request('map/refresh', 'refresh');}},
        adopt: () => {if (!busy.value) {return request('map/adopt-server-state', 'adopt');}},
        setAuto: (enabled: boolean) => request('map/set-auto-maintenance', 'settings', { enabled }),
        setProjection: (enabled: boolean) => request('map/set-projection', 'projection', { enabled }),
        update: () => {if (!disabledReason.value && state.value.map) {return request('map/maintain-once', 'maintain');}},
        rebuild: () => {if (!disabledReason.value) {return request('map/rebuild', 'rebuild');}},
    };
}
