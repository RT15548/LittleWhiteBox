<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { observe } from '../scene.js';
import type { PersonId, WorkTask } from '../model.js';
import { ITEMS, SANITATION, WORK_NAMES } from '../survival-content.js';
import { withinReach } from '../space.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ observation: ReturnType<typeof observe>; task: { kind: 'bury_body'; subject: PersonId } | { kind: 'exhume_body'; grave: number }; disabled: boolean }>();
const emit = defineEmits<{ work: [task: WorkTask] }>();
const selected = ref('');
const tools = computed(() => props.observation.items.filter(i => SANITATION.diggingTools.includes(i.kind) && (i.location.kind === 'carried'
    ? i.location.person === props.observation.observer : i.location.kind === 'ground' && withinReach(i.location.position, props.observation.self.position))));
watch(tools, items => { if (!items.some(i => i.id === selected.value)) { selected.value = items[0]?.id ?? ''; } }, { immediate: true });
</script>
<template>
    <form class="island-digging" @submit.prevent="emit('work', { ...task, tool: selected })">
        <p>{{ task.kind === 'bury_body' ? c.burialNote : c.exhumationNote }}</p>
        <label v-if="tools.length">{{ c.diggingTool }}<select v-model="selected" :disabled="disabled"><option v-for="item in tools" :key="item.id" :value="item.id">{{ ITEMS[item.kind].name }}</option></select></label>
        <p v-else>{{ c.noDiggingTool }}</p>
        <small>{{ c.duration(task.kind === 'bury_body' ? SANITATION.burySeconds : SANITATION.exhumeSeconds) }}</small>
        <button :disabled="disabled || !selected">{{ WORK_NAMES[task.kind] }}</button>
    </form>
</template>
<style scoped>
.island-digging{display:grid;gap:10px;margin-top:14px}.island-digging p,.island-digging small{font-size:12px;line-height:1.7;color:#526f69;margin:0}.island-digging label{font-size:12px;display:grid;gap:6px}.island-digging select{min-width:0;width:100%;min-height:40px;background:white;border:1px solid var(--island-line);border-radius:4px;padding:6px}
</style>
