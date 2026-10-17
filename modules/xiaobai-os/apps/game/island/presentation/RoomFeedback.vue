<script setup lang="ts">
import { computed } from 'vue';
import type { createIslandClient } from '../client.js';
import { COPY as c, errorText } from '../copy.js';
import GmFailure from './GmFailure.vue';

const props = defineProps<{ client: ReturnType<typeof createIslandClient>; disabled: boolean }>();
const view = computed(() => props.client.view.value);
const pending = computed(() => !!view.value?.pending || !!view.value?.memoryPending);
const failedGm = computed(() => !!view.value?.planFault && !pending.value && !props.client.uncertain.value);
const gmError = computed(() => view.value?.planFault ? errorText({ code: view.value.planFault }) : '');
const error = computed(() => props.client.error.value);
</script>

<template>
    <div v-if="failedGm || error || pending || client.uncertain.value" class="island-recovery">
        <GmFailure v-if="failedGm" :error="gmError" :busy="client.busy.value" :disabled="disabled" @retry="client.think()" @settings="client.settings()" />
        <div v-else class="island-recovery-save" role="alert">
            <span>{{ error || c.recover }}</span>
            <button :disabled="client.busy.value" @click="pending ? client.recover() : client.read()">{{ pending || client.uncertain.value ? c.recover : c.retry }}</button>
        </div>
    </div>
</template>

<style scoped>
.island-recovery{flex-shrink:0;min-height:0;overscroll-behavior:contain;background:#fff6eb;color:#835738;border-block:1px solid #edceaa;font-size:12px;scrollbar-width:thin}
.island-recovery-save{display:flex;align-items:center;gap:10px;padding:10px 14px}
.island-recovery-save span{flex:1;min-width:0;overflow-wrap:anywhere}
.island-recovery-save button{flex-shrink:0;font-size:12px;background:transparent}
</style>
