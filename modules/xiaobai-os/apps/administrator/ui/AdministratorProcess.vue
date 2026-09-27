<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { AdministratorLive, AdministratorProcessRound, AdministratorRow } from '../domain/types.js';
import MessageMarkdown from '../../../shell/app-src/components/MessageMarkdown.vue';
import { ADMINISTRATOR_COPY as C, administratorError } from './copy.js';
const props = defineProps<{ row: AdministratorRow; live: AdministratorLive | null; unsaved: AdministratorProcessRound[] | null; bridge: XiaobaiOsAppProps['bridge']; chatIdentity: string }>();
const opened = ref(false), retained = shallowRef<AdministratorProcessRound[]>([]), loading = ref(false), error = ref('');
const rounds = computed(() => props.live?.process ?? retained.value);
const count = computed(() => props.live?.process.length ?? props.unsaved?.length ?? props.row.processCount);
const expanded = computed(() => !!props.live || opened.value);
let generation = 0;
async function refresh() {
    const request = ++generation;
    error.value = ''; loading.value = false;
    if (!expanded.value || props.live || !count.value) { retained.value = []; return; }
    if (props.unsaved) { retained.value = props.unsaved; return; }
    const { turnId, revision } = props.row, chatIdentity = props.chatIdentity;
    const current = () => request === generation && chatIdentity === props.chatIdentity && turnId === props.row.turnId && revision === props.row.revision;
    loading.value = true;
    try {
        const response = await props.bridge.request('administrator/process', { chatIdentity, turnId, revision }) as { result: AdministratorProcessRound[] };
        if (current()) { retained.value = response.result; }
    } catch (cause) { if (current()) { error.value = administratorError(cause); } }
    finally { if (current()) { loading.value = false; } }
}
// Only a run boundary changes the user's expansion choice, never a tool/text/revision update.
watch([() => props.chatIdentity, () => props.row.id, () => props.row.revision, () => !!props.live, () => props.unsaved, opened], (next, previous) => {
    if (next[0] !== previous[0] || next[1] !== previous[1] || next[3] !== previous[3]) { opened.value = false; }
    void refresh();
}, { immediate: true });
onBeforeUnmount(() => { generation++; });
</script>

<template>
    <section v-if="count" class="admin-process" :class="{ 'is-running': !!live }">
        <button v-if="!live" type="button" class="admin-process-toggle" :aria-expanded="expanded" @click="opened = !opened">
            <span aria-hidden="true">{{ expanded ? '⌄' : '›' }}</span>{{ C.process(count) }}
        </button>
        <div v-if="expanded" class="admin-process-body">
            <div v-for="round in rounds" :key="round.index" class="admin-process-round">
                <MessageMarkdown v-if="round.text" class="admin-markdown admin-process-narration" :text="round.text" />
                <div v-for="tool in round.tools" :key="tool.id" class="admin-operation-line">
                    <i class="admin-operation-dot" :class="`is-${tool.status}`" /><span>{{ tool.name }}<small v-if="tool.target"> · {{ tool.target }}</small></span>
                    <small>{{ tool.status === 'queued' ? C.queued : tool.status === 'not-executed' ? C.notExecuted : C.operations[tool.status] }}</small>
                </div>
            </div>
            <span v-if="loading" class="admin-muted">{{ C.processLoading }}</span>
            <p v-if="error" class="admin-error" role="status">{{ error }}<button type="button" @click="refresh">{{ C.check }}</button></p>
        </div>
    </section>
</template>
