<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IslandView } from '../service.js';
import type { NpcId, Operation } from '../model.js';
import { ITEMS } from '../survival-content.js';
import { coveringMaterial } from '../remains.js';
import { withinReach } from '../space.js';
import { COPY as c } from '../copy.js';
const props = defineProps<{ observation: NonNullable<IslandView['player']>; subject: NpcId; disabled: boolean }>();
const emit = defineEmits<{ act: [operation: Operation]; drag: [subject: NpcId] }>();
const selected = ref('');
const materials = computed(() => props.observation.items.filter(i => coveringMaterial(i.kind) && (i.location.kind === 'carried'
    ? i.location.person === 'player' : i.location.kind === 'ground' && withinReach(i.location.position, props.observation.self.position))));
const reachable = computed(() => props.observation.people.some(p => p.id === props.subject && withinReach(p.position, props.observation.self.position)));
const busy = computed(() => props.disabled || !!props.observation.self.activity || !reachable.value);
watch(materials, items => { if (!items.some(i => i.id === selected.value)) { selected.value = items[0]?.id ?? ''; } }, { immediate: true });
</script>
<template>
    <section class="island-remains">
        <button :disabled="busy" @click="emit('drag',subject)">{{ c.dragBody }}</button>
        <p>{{ c.bodyHandlingNote }}</p>
        <form v-if="materials.length" @submit.prevent="emit('act',{kind:'work',task:{kind:'cover_body',subject,item:selected}})">
            <label>{{ c.coverMaterial }}<select v-model="selected" :disabled="busy"><option v-for="item in materials" :key="item.id" :value="item.id">{{ ITEMS[item.kind].name }} × {{ item.quantity }}</option></select></label>
            <button :disabled="busy || !selected">{{ c.coverBody }}</button>
        </form>
        <p v-else>{{ c.noCoverMaterial }}</p>
    </section>
</template>
<style scoped>
.island-remains{border-bottom:1px solid var(--island-line);padding:0 0 16px;margin-bottom:16px}.island-remains p{font-size:12px;line-height:1.7;color:#628078}.island-remains label{font-size:12px;display:grid;gap:6px}.island-remains form{display:grid;gap:10px}.island-remains select{min-width:0;width:100%;min-height:36px;background:white;border:1px solid var(--island-line);border-radius:4px;padding:6px}
</style>
