import { computed, onBeforeUnmount, onMounted, ref, shallowRef, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { WorldClientState } from '../types.js';

export function useWorldState(props: XiaobaiOsAppProps) {
    const state = shallowRef(structuredClone(toRaw(props.initialState as WorldClientState)));
    const pending = ref(false);
    const localMessage = ref('');
    const localError = ref(false);
    let mounted = false;
    let pushed = 0;
    let unsubscribe = () => {};
    function apply(next: WorldClientState) {
        state.value = structuredClone(toRaw(next));
        localMessage.value = '';
        localError.value = false;
    }
    const writable = computed(() => !pending.value && state.value.writeState === 'ready');
    const refreshing = computed(() => state.value.maintenance === 'running');
    const notice = computed(() => state.value.writeState !== 'ready'
        ? state.value.message : localMessage.value || state.value.message);
    const error = computed(() => localError.value || state.value.maintenance === 'error'
        || ['failed', 'unconfirmed', 'conflict'].includes(state.value.writeState));

    async function request(action: string, extra: Record<string, unknown> = {}) {
        if (pending.value) { return; }
        pending.value = true;
        localMessage.value = '';
        localError.value = false;
        const identity = state.value.chatIdentity;
        const version = pushed;
        try {
            const response = await props.bridge.request(`world/${action}`, { chatIdentity: identity, ...extra }, 35_000) as {
                result: { state: WorldClientState; message?: string };
            };
            if (!mounted || state.value.chatIdentity !== identity) { return; }
            if (version === pushed && response.result.state.chatIdentity === identity) { apply(response.result.state); }
            if (response.result.message) { localMessage.value = response.result.message; }
        } catch (caught) {
            if (!mounted || state.value.chatIdentity !== identity) { return; }
            const message = caught instanceof Error ? caught.message : '';
            localMessage.value = message === 'host_request_timeout'
                ? '暂时没收到结果，更新可能还在继续。请稍后重新加载，不要再次生成。'
                : message.startsWith('请先在 API') ? '请先在 API 应用中配置可用的模型。'
                    : '操作未完成，请检查保存状态或稍后重试。';
            localError.value = true;
        } finally { if (mounted) { pending.value = false; } }
    }
    onMounted(() => {
        mounted = true;
        unsubscribe = props.bridge.subscribe(message => {
            if (message.type === 'world/state') {
                const next = (message.payload as { state: WorldClientState }).state;
                if (next.chatIdentity === state.value.chatIdentity) { pushed++; apply(next); }
            } else if (message.type === 'world/error') {
                localError.value = true;
                localMessage.value = '新闻暂时加载不了，请重试。';
            }
        });
    });
    onBeforeUnmount(() => { mounted = false; unsubscribe(); });
    return { state, pending, writable, refreshing, notice, error, request };
}
