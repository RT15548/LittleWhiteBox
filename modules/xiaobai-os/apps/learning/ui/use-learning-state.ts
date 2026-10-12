import { computed, onBeforeUnmount, onMounted, ref, shallowRef, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import { FrameRequestError, HostRequestError } from '../../../shell/app-src/frame-bridge.js';
import type { LearningClientState } from '../types.js';
import { LEARNING_REQUEST_COPY } from './learning-copy.js';
import { learningActionAvailable, learningActionBusy, learningActionLane } from '../application/action-availability.js';

export function useLearningState(props: XiaobaiOsAppProps) {
    const state = shallowRef(structuredClone(toRaw(props.initialState as LearningClientState)));
    const pending = ref(false);
    const localIssue = ref<'busy' | 'notSent' | 'rejected' | 'unknown' | null>(null);
    const localMessage = computed(() => localIssue.value ? LEARNING_REQUEST_COPY[localIssue.value] : '');
    const needsRefresh = computed(() => localIssue.value === 'unknown' || localIssue.value === 'rejected');
    let mounted = false;
    let pushed = 0;
    let unsubscribe = () => {};
    const canRequest = (action: string) => !pending.value && learningActionAvailable(action, state.value);
    const writable = computed(() => canRequest('submit'));
    const canChat = computed(() => canRequest('talk'));
    async function request(action: string, extra: Record<string, unknown> = {}) {
        if (pending.value) { return; }
        if (learningActionBusy(learningActionLane(action, extra.target), state.value)) { localIssue.value = 'busy'; return; }
        pending.value = true; localIssue.value = null;
        const identity = state.value.chatIdentity;
        const version = pushed;
        let dispatched = false;
        try {
            // Learning commands carry JSON data only. Snapshot at this boundary so nested
            // Vue proxies (quotes, answer arrays, settings) never reach postMessage.
            const payload = JSON.parse(JSON.stringify({ chatIdentity: identity, ...extra }));
            dispatched = true;
            const response = await props.bridge.request(`learning/${action}`, payload, 35_000) as {
                result: { state: LearningClientState; document?: unknown; rejected?: 'busy' };
            };
            if (!mounted || state.value.chatIdentity !== identity) { return; }
            if (pushed === version && response.result.state.chatIdentity === identity) { state.value = response.result.state; }
            if (response.result.rejected) { localIssue.value = response.result.rejected; }
            return response.result;
        } catch (error) {
            if (mounted && state.value.chatIdentity === identity) {
                localIssue.value = !dispatched || error instanceof FrameRequestError && error.code === 'host_request_not_sent' ? 'notSent'
                    : error instanceof HostRequestError ? 'rejected' : 'unknown';
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
            if (next.chatIdentity === state.value.chatIdentity) { pushed++; state.value = next; }
        });
    });
    onBeforeUnmount(() => { mounted = false; unsubscribe(); });
    return { state, pending, writable, canChat, canRequest, localIssue, localMessage, needsRefresh, request };
}
