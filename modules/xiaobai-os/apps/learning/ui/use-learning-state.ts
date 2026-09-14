import { computed, onBeforeUnmount, onMounted, ref, shallowRef, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { LearningClientState } from '../types.js';

export function useLearningState(props: XiaobaiOsAppProps) {
    const state = shallowRef(structuredClone(toRaw(props.initialState as LearningClientState)));
    const pending = ref(false);
    const localMessage = ref('');
    let mounted = false;
    let pushed = 0;
    let unsubscribe = () => {};
    const writable = computed(() => !pending.value && !state.value.busy && state.value.storage === 'ready');
    async function request(action: string, extra: Record<string, unknown> = {}) {
        if (pending.value) { return; }
        pending.value = true; localMessage.value = '';
        const identity = state.value.chatIdentity;
        const version = pushed;
        try {
            const response = await props.bridge.request(`learning/${action}`, { chatIdentity: identity, ...extra }, 35_000) as {
                result: { state: LearningClientState; document?: unknown };
            };
            if (!mounted || state.value.chatIdentity !== identity) { return; }
            if (pushed === version && response.result.state.chatIdentity === identity) { state.value = response.result.state; }
            return response.result;
        } catch {
            if (mounted && state.value.chatIdentity === identity) {
                localMessage.value = '暂时没收到操作结果。请先重新加载，确认是否已保存，不要重复提交或生成。';
            }
        } finally { if (mounted) { pending.value = false; } }
    }
    onMounted(() => {
        mounted = true;
        unsubscribe = props.bridge.subscribe(event => {
            if (event.type === 'learning/media') {
                state.value = { ...state.value, media: (event.payload as { media: LearningClientState['media'] }).media }; return;
            }
            if (event.type !== 'learning/state') { return; }
            const next = (event.payload as { state: LearningClientState }).state;
            if (next.chatIdentity === state.value.chatIdentity) { pushed++; state.value = next; localMessage.value = ''; }
        });
    });
    onBeforeUnmount(() => { mounted = false; unsubscribe(); });
    return { state, pending, writable, localMessage, request };
}
